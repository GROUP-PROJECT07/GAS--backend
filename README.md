# GAS--Backend

This repository contains the backend infrastructure for the Ghana Audit Service Correspondence Management System (CMS), built using Firebase. It provides authentication, data storage, file handling, and access control for the CMS application.

## Overview

The backend is designed to support a web-based system that replaces manual Excel tracking with a cloud-based platform for managing received and dispatched correspondence within the Ghana Audit Service.

## Features

- Email/password authentication using Firebase Authentication
- Role-based access control (Admin and Department-level Users)
- Firestore database for structured correspondence records
- File upload support with Firebase Storage (max file size: 5MB)
- Auto-generated registry numbers using Firebase Cloud Functions
- Security rules to enforce role and department-level access restrictions

## Firestore Structure

```

/users/{uid}

* email
* role: "admin" | "user"
* department

/correspondence/{docId}

* subject
* sender
* recipient
* date
* department
* status
* registryNumber
* fileURL
* createdBy

````

## Security Rules Summary

**Firestore:**
- Users can read/write records only in their own department.
- Admins can access all records.
- Roles are retrieved from the `/users` collection.

**Storage:**
- Only authenticated users can upload or download files.
- Maximum upload size: 5MB
- Files stored under `/uploads/`

## Technology Stack

- Firebase Firestore (NoSQL document database)
- Firebase Authentication (user accounts and roles)
- Firebase Storage (file attachments)
- Firebase Cloud Functions (optional serverless logic)

## Local Development

### Requirements

- Node.js and npm
- Firebase CLI (`npm install -g firebase-tools`)

### Setup

1. Clone this repository
2. Initialize Firebase (if not already):
   ```bash
   firebase login
   firebase init
````

3. Select Firestore, Auth, Storage, and Functions
4. Start emulators locally:

   ```bash
   firebase emulators:start
   ```

## Deployment

To deploy to Firebase production environment:

```bash
firebase deploy
```

This will deploy Firestore rules, Storage rules, and Cloud Functions if configured.

## License

This project is maintained by the development team supporting the Ghana Audit Service. Use is restricted to official government or approved pilot use only unless otherwise stated.



/correspondence/
  - docID
    - subject
    - sender
    - recipient
    - date
    - department
    - status
    - registryNumber
    - fileURL
    - createdBy

/users/
  - uid
    - email
    - role ("admin" | "user")
    - department


