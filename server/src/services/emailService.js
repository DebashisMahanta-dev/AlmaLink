const GRAPH_SCOPE = "https://graph.microsoft.com/.default";

const getEmailConfig = () => ({
  tenantId: String(process.env.TENANT_ID || "").trim(),
  clientId: String(process.env.CLIENT_ID || "").trim(),
  clientSecret: String(process.env.CLIENT_SECRET || "").trim(),
  mailbox: String(process.env.MAILBOX || "").trim(),
  forcedRecipient: String(process.env.TEST_EMAIL_REDIRECT_TO || "").trim()
});

let graphTokenCache = {
  accessToken: "",
  expiresAt: 0
};

const htmlWrapper = (title, body) => `
  <div style="font-family: Arial, sans-serif; background: #f6f9fc; padding: 24px;">
    <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e6edf5;">
      <div style="padding: 28px 28px 18px; background: linear-gradient(135deg, #0f2742 0%, #185fa5 100%); color: #ffffff;">
        <div style="font-size: 20px; font-weight: 800; letter-spacing: 0.02em;">GCE Connect</div>
        <div style="margin-top: 8px; font-size: 13px; opacity: 0.88;">${title}</div>
      </div>
      <div style="padding: 28px; color: #15304c;">
        ${body}
      </div>
    </div>
  </div>
`;

const buildLinkButton = (href, label) => `
  <div style="margin: 24px 0 8px;">
    <a href="${href}" style="display:inline-block; background: linear-gradient(135deg, #20b14a 0%, #31c85d 100%); color: #ffffff; text-decoration:none; padding: 12px 22px; border-radius: 999px; font-weight: 700;">
      ${label}
    </a>
  </div>
`;

const normalizeRecipients = (to) => {
  if (Array.isArray(to)) {
    return to;
  }
  if (typeof to === "string") {
    return to
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }
  return [];
};

const applyTestRecipientRedirect = ({ to, subject, html, text }) => {
  const { forcedRecipient } = getEmailConfig();
  if (!forcedRecipient) {
    return { to, subject, html, text };
  }

  const originalRecipients = normalizeRecipients(to);
  const recipientNote = originalRecipients.length ? originalRecipients.join(", ") : "unknown recipient";

  return {
    to: forcedRecipient,
    subject: `[Redirected] ${subject}`,
    html: `
      <p style="font-size:13px;color:#6b7280;margin:0 0 16px;">
        Original recipient: <strong>${recipientNote}</strong>
      </p>
      ${html}
    `,
    text: `Original recipient: ${recipientNote}\n\n${text || ""}`
  };
};

const toGraphRecipients = (recipients) =>
  normalizeRecipients(recipients).map((address) => ({
    emailAddress: { address }
  }));

const getGraphAccessToken = async ({ tenantId, clientId, clientSecret }) => {
  const now = Date.now();
  if (graphTokenCache.accessToken && graphTokenCache.expiresAt - 60_000 > now) {
    return graphTokenCache.accessToken;
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("scope", GRAPH_SCOPE);
  params.append("grant_type", "client_credentials");

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Microsoft Graph token request failed (${response.status}): ${details}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("Microsoft Graph token response did not include an access token");
  }

  graphTokenCache = {
    accessToken: data.access_token,
    expiresAt: now + Number(data.expires_in || 3599) * 1000
  };

  return graphTokenCache.accessToken;
};

const sendViaMicrosoftGraph = async ({ to, subject, html, text, bcc }) => {
  const config = getEmailConfig();
  const { tenantId, clientId, clientSecret, mailbox } = config;
  if (!tenantId || !clientId || !clientSecret || !mailbox) {
    return false;
  }

  const outgoing = applyTestRecipientRedirect({ to, subject, html, text });
  const toRecipients = toGraphRecipients(outgoing.to);
  if (!toRecipients.length) {
    throw new Error("No recipients provided for email");
  }

  const accessToken = await getGraphAccessToken(config);
  const payload = {
    message: {
      subject: outgoing.subject,
      body: {
        contentType: outgoing.html ? "HTML" : "Text",
        content: outgoing.html || outgoing.text || ""
      },
      toRecipients
    },
    saveToSentItems: true
  };

  if (bcc?.length) {
    payload.message.bccRecipients = toGraphRecipients(bcc);
  }

  const sendUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailbox)}/sendMail`;
  const response = await fetch(sendUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Microsoft Graph sendMail request failed (${response.status}): ${details}`);
  }

  return true;
};

export const sendEmail = async ({ to, subject, html, text, bcc }) => {
  try {
    const sentViaGraph = await sendViaMicrosoftGraph({ to, subject, html, text, bcc });
    if (sentViaGraph) {
      return true;
    }

    console.warn("[email] No mail provider configured. Skipping email send.");
    return false;
  } catch (error) {
    console.error("[email] Failed to send email:", error.message);
    return false;
  }
};

export const sendBulkEmail = async ({ recipients = [], subject, html, text }) => {
  if (!recipients.length) {
    return { sent: 0, failed: 0 };
  }

  const results = await Promise.allSettled(
    recipients.map((recipient) =>
      sendEmail({
        to: recipient.email,
        subject,
        html: html(recipient),
        text: typeof text === "function" ? text(recipient) : text
      })
    )
  );

  return results.reduce(
    (acc, result) => {
      if (result.status === "fulfilled" && result.value) {
        acc.sent += 1;
      } else {
        acc.failed += 1;
      }
      return acc;
    },
    { sent: 0, failed: 0 }
  );
};

export const sendVerificationEmail = async (email, name, verificationOTP, verificationLink) => {
  return sendEmail({
    to: email,
    subject: "Your AlmaLink Email Verification Code",
    html: htmlWrapper(
      "Email verification",
      `
        <h2 style="margin: 0 0 12px; color: #15304c;">Welcome to AlmaLink, ${name}!</h2>
        <p style="margin: 0; color: #607286; line-height: 1.7;">
          Use the verification code below to confirm your email address.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display:inline-block; background:#f3f7fb; color:#20b14a; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 18px 26px; border-radius: 14px;">
            ${verificationOTP}
          </div>
        </div>
        <p style="margin: 0; color: #607286; line-height: 1.7;">This code expires in 10 minutes.</p>
        ${buildLinkButton(verificationLink, "Verify Email")}
      `
    ),
    text: `Welcome to AlmaLink, ${name}! Your verification code is ${verificationOTP}. Visit ${verificationLink} to verify your email.`
  });
};

export const sendWelcomeEmail = async (email, name) => {
  return sendEmail({
    to: email,
    subject: "Welcome to AlmaLink!",
    html: htmlWrapper(
      "Welcome",
      `
        <h2 style="margin: 0 0 12px; color: #15304c;">Welcome, ${name}!</h2>
        <p style="margin: 0; color: #607286; line-height: 1.7;">
          Your email has been verified. You can now log in and start connecting with alumni and exploring opportunities.
        </p>
        ${buildLinkButton(process.env.CLIENT_URL || "http://localhost:5173", "Go to AlmaLink")}
      `
    ),
    text: `Welcome, ${name}! Your email has been verified. Visit ${process.env.CLIENT_URL || "http://localhost:5173"} to continue.`
  });
};

export const sendAlumniApprovalEmail = async ({ email, name }) => {
  return sendEmail({
    to: email,
    subject: "Your GCE Connect account has been approved",
    html: htmlWrapper(
      "Account approved",
      `
        <h2 style="margin: 0 0 12px; color: #15304c;">Hello ${name}, your alumni account is approved.</h2>
        <p style="margin: 0; color: #607286; line-height: 1.7;">
          You can now access alumni features, post jobs, and participate in the community.
        </p>
        ${buildLinkButton(process.env.CLIENT_URL || "http://localhost:5173", "Open GCE Connect")}
      `
    ),
    text: `Hello ${name}, your alumni account is approved. Visit ${process.env.CLIENT_URL || "http://localhost:5173"} to continue.`
  });
};

export const sendNewJobAlertEmail = async ({ email, name, job, matchScore, matchedSkills = [] }) => {
  const skillsLine = matchedSkills.length ? matchedSkills.slice(0, 3).join(", ") : "your profile";
  return sendEmail({
    to: email,
    subject: `New job match: ${job.title} at ${job.company}`,
    html: htmlWrapper(
      "New job alert",
      `
        <h2 style="margin: 0 0 12px; color: #15304c;">Hi ${name}, a new job may fit your profile.</h2>
        <p style="margin: 0 0 12px; color: #607286; line-height: 1.7;">
          <strong>${job.title}</strong> at <strong>${job.company}</strong> is now live.
        </p>
        <p style="margin: 0 0 18px; color: #607286; line-height: 1.7;">
          Match score: <strong>${matchScore || 0}%</strong><br />
          Matched skills: ${skillsLine}
        </p>
        ${buildLinkButton(`${process.env.CLIENT_URL || "http://localhost:5173"}/jobs/${job._id}`, "View Job")}
      `
    ),
    text: `A new job may fit your profile: ${job.title} at ${job.company}. Match score ${matchScore || 0}%.`
  });
};

export const sendJobApplicationEmailToPoster = async ({ email, name, job, student }) => {
  return sendEmail({
    to: email,
    subject: `New application for ${job.title}`,
    html: htmlWrapper(
      "New application",
      `
        <h2 style="margin: 0 0 12px; color: #15304c;">${student.name} applied to your job post.</h2>
        <p style="margin: 0; color: #607286; line-height: 1.7;">
          Job: <strong>${job.title}</strong> at <strong>${job.company}</strong><br />
          Applicant: <strong>${student.name}</strong> (${student.email})
        </p>
        ${buildLinkButton(`${process.env.CLIENT_URL || "http://localhost:5173"}/jobs/${job._id}`, "Review Job")}
      `
    ),
    text: `${student.name} applied to ${job.title} at ${job.company}.`
  });
};

export const sendJobApplicationConfirmation = async ({ email, name, job }) => {
  return sendEmail({
    to: email,
    subject: `Application submitted for ${job.title}`,
    html: htmlWrapper(
      "Application submitted",
      `
        <h2 style="margin: 0 0 12px; color: #15304c;">Hi ${name}, your application is submitted.</h2>
        <p style="margin: 0; color: #607286; line-height: 1.7;">
          You applied for <strong>${job.title}</strong> at <strong>${job.company}</strong>.
        </p>
        ${buildLinkButton(`${process.env.CLIENT_URL || "http://localhost:5173"}/jobs/${job._id}`, "View Job")}
      `
    ),
    text: `Your application for ${job.title} at ${job.company} has been submitted.`
  });
};

export const sendNewEventAlertEmail = async ({ email, name, event }) => {
  return sendEmail({
    to: email,
    subject: `New event: ${event.title}`,
    html: htmlWrapper(
      "New event alert",
      `
        <h2 style="margin: 0 0 12px; color: #15304c;">Hi ${name}, a new event is coming up.</h2>
        <p style="margin: 0 0 12px; color: #607286; line-height: 1.7;">
          <strong>${event.title}</strong><br />
          ${new Date(event.startsAt).toLocaleString()}<br />
          ${event.location || event.format || "Online"}
        </p>
        ${buildLinkButton(`${process.env.CLIENT_URL || "http://localhost:5173"}/events`, "View Events")}
      `
    ),
    text: `New event: ${event.title} at ${new Date(event.startsAt).toLocaleString()}.`
  });
};

export const sendEventRegistrationEmail = async ({ email, name, event }) => {
  return sendEmail({
    to: email,
    subject: `You're registered for ${event.title}`,
    html: htmlWrapper(
      "Event registration",
      `
        <h2 style="margin: 0 0 12px; color: #15304c;">You're registered, ${name}.</h2>
        <p style="margin: 0 0 12px; color: #607286; line-height: 1.7;">
          You’ve successfully registered for <strong>${event.title}</strong>.
        </p>
        <p style="margin: 0; color: #607286; line-height: 1.7;">
          When: ${new Date(event.startsAt).toLocaleString()}<br />
          Where: ${event.location || event.format || "Online"}
        </p>
        ${buildLinkButton(`${process.env.CLIENT_URL || "http://localhost:5173"}/events`, "View Event")}
      `
    ),
    text: `You're registered for ${event.title}.`
  });
};
