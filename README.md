# Fake DBS Update Service
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/BenjaminEHowe/fake-dbs-update-service)

This repository contains a fake implementation of the Disclosure and Barring Service's [Multiple Status Check Facility](https://assets.publishing.service.gov.uk/media/67449590ece939d55ce93006/Multiple_Status_Checking_Guide_V2.0_23112024.pdf).
Perhaps confusingly, this is an API which allows employers to run an "update check" on a (single) DBS certificate to verify if the certificate is still current.
In the DBS' own words, "a Multiple Status Check is many Single Status Checks happening in quick succession".

## History / Context
The Disclosure and Barring Service (DBS) was formed in 2012, replacing the Criminal Records Bureau.
One of the key advantages of certificates issued by the DBS is that they can be enrolled in the [update service](https://www.gov.uk/dbs-update-service) (excluding basic certificates).
As of April 2025 the charge for the update service is £16 per year, although this is waived for volunteers.
The update service means that a DBS certificate can be "evergreen" and doesn't need to be perodically replaced.
In addition, a certificate issued for one employer can be verified by a different employer provided that the certificate covers the appropriate checks.
See [the gov.uk page about the DBS](https://www.gov.uk/government/organisations/disclosure-and-barring-service/about) for more details.

## Usage
The API takes a few inputs, all of which are required:
- `disclosureRef`: must be a 12-digit string. The first digit will determine the status code returned:
  - Starts with 1: returns status `NO_MATCH_FOUND`.
  - Starts with 2: returns status `BLANK_NO_NEW_INFO`.
  - Starts with 3: returns status `NON_BLANK_NO_NEW_INFO`.
  - Starts with 4: returns status `NEW_INFO`.
  - Starts with 9: throws 500 Internal Server Error.
  - Any other digit: throws 400 Bad Request.
- `dateOfBirth`: can be any valid date.
- `surname`: can be any string.
- `hasAgreedToTermsAndConditions`: must be `true`.
- `organisationName`: can be any string.
- `employeeSurname`: can be any string.
- `employeeForename`: can be any string.
