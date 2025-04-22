export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return new Response("Method not allowed", {
      headers: { "content-type": "text/plain" },
      status: 405,
    });
  }

  const errors = [];
  const { searchParams } = new URL(context.request.url);

  const disclosureRef = context.params.disclosureRef;
  if (disclosureRef.length !== 12) {
    errors.push(`\`disclosureRef\` must be a 12-digit string, but length was ${disclosureRef.length}.`);
  }
  if (!/^\d+$/.test(disclosureRef)) {
    errors.push(`\`disclosureRef\` must contain only digits, but actual string was "${disclosureRef}".`);
  }

  const dateOfBirth = searchParams.get("dateOfBirth");
  if (dateOfBirth === null) {
    errors.push("`dateOfBirth` is missing but is required.");
  } else {
    const dateRegexMatch = dateOfBirth.match(/^(\d+?)\/(\d+?)\/(\d+)$/);
    if (dateRegexMatch === null) {
      errors.push("`dateOfBirth` doesn't appear to be in the format DD/MM/YYYY");
    } else {
      // verify that we got DD/MM/YYYY and not (e.g.) MM/DD/YYYY -- this is just a "sniff test" so will accept e.g. 31/02/2025
      const day = dateRegexMatch[1];
      if (day < 1 || day > 31) {
        errors.push(`day of birth (from \`dateOfBirth\`) must be within range 1-31 but was ${day}.`)
      }
      const month = dateRegexMatch[2];
      if (month < 1 || month > 12) {
        errors.push(`month of birth (from \`dateOfBirth\`) must be within range 1-12 but was ${month}.`)
      }
      const year = dateRegexMatch[3];
      if (year < 1900) {
        errors.push(`year of birth (from \`dateOfBirth\`) must not be less than 1900 but was ${year}.`)
      }
      const currentYear = new Date().getFullYear();
      const maximumYear = currentYear - 16; // see https://www.gov.uk/guidance/dbs-check-requests-guidance-for-employers
      if (year > maximumYear) {
        errors.push(`year of birth (from \`dateOfBirth\`) must not be greater than ${maximumYear} but was ${year}.`)
      }
    }
  }

  const surname = searchParams.get("surname");
  if (surname === null) {
    errors.push("`surname` is missing but is required.")
  }

  const hasAgreedTermsAndConditions = searchParams.get("hasAgreedTermsAndConditions");
  if (hasAgreedTermsAndConditions === null) {
    errors.push("`hasAgreedTermsAndConditions` is missing but is required.");
  } else {
    if (hasAgreedTermsAndConditions !== "true") {
      errors.push("`hasAgreedTermsAndConditions` must be equal to \"true\".");
    }
  }

  const organisationName = searchParams.get("organisationName");
  if (organisationName === null) {
    errors.push("`organisationName` is missing but is required.")
  }

  const employeeSurname = searchParams.get("employeeSurname");
  if (employeeSurname === null) {
    errors.push("`employeeSurname` is missing but is required.")
  }

  const employeeForename = searchParams.get("employeeForename");
  if (employeeForename === null) {
    errors.push("`employeeForename` is missing but is required.")
  }

  if (errors.length !== 0) {
    return new Response(`Errors: \n- ${errors.join("\n- ")}`, {
      headers: { "content-type": "text/plain" },
      status: 400,
    });
  }

  const disclosureRefFirstDigit = disclosureRef[0];

  switch (disclosureRefFirstDigit) {
    case '1':
      return new Response(NOT_FOUND_XML, { headers: { "content-type": "application/xml" } });
    case '2':
      return new Response(generateXml("BLANK_NO_NEW_INFO", surname), { headers: { "content-type": "application/xml" } });
    case '3':
      return new Response(generateXml("NON_BLANK_NO_NEW_INFO", surname), { headers: { "content-type": "application/xml" } });
    case '4':
      return new Response(generateXml("NEW_INFO", surname), { headers: { "content-type": "application/xml" } });
    default:
      return new Response(`Unrecognised \`disclosureRef\` first digit: ${disclosureRefFirstDigit}`, {
        headers: { "content-type": "text/plain" },
        status: 400,
      });
  }
}

function generateXml(status, surname) {
  const oneYearBeforeToday = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split("T")[0];
  return `<statusCheckResult>
    <statusCheckResultType>SUCCESS</statusCheckResultType>
    <status>${status}</status>
    <forename>TAYLOR</forename>
    <surname>${surname.toUpperCase()}</surname>
    <printDate class="sql-date">${oneYearBeforeToday}</printDate>
</statusCheckResult>`;
}

const NOT_FOUND_XML = `<statusCheckResult>
    <statusCheckResultType>SUCCESS</statusCheckResultType>
    <status>NO_MATCH_FOUND</status>
</statusCheckResult>`;
