# Product Requirements Document (PRD)

## School Management System (SMS)

---

## 1. Introduction

A **School Management System (SMS)** is a centralized platform that streamlines the administrative and financial operations of a school. It provides a single system for managing student enrollment, fee collection, payments, and school administration while ensuring transparency, accuracy, and efficiency.

The system is designed around role-based access control, allowing each user to access only the information and features relevant to their responsibilities.

---

## 2. Objectives

- Digitize school administrative processes
- Simplify student enrollment and registration
- Automate fee invoicing and payment tracking
- Improve financial management
- Enhance transparency between the school and parents
- Reduce paperwork and manual processes
- Provide centralized reporting and record management

---

## 3. Core Roles

| Role | Main Responsibilities |
|------|----------------------|
| **Super Admin** | Manage multiple schools, licensing, system configuration, global settings, user roles, and overall platform administration |
| **School Administrator** | Oversee daily school operations, manage admissions, maintain school records, configure academic sessions, and supervise administrative activities |
| **Registrar** | Register students, manage enrollment records, generate student fee invoices, maintain student documents, and coordinate admission processes |
| **Accountant** | Manage fee structures, verify and record payments, generate receipts, track income, manage financial records, prepare financial reports, and oversee the school's financial operations |
| **Parents** | View their child's enrollment information, monitor fee invoices, payment history, outstanding balances, and download payment receipts |

---

## 4. User Interfaces

### 4.1 Role-Specific Dashboards

| Interface | Intended User |
|-----------|---------------|
| **1. Super Admin Dashboard** | Super Admin |
| **2. School Administrator Dashboard** | School Administrator |
| **3. Registrar Dashboard** | Registrar |
| **4. Accountant Dashboard** | Accountant |
| **5. Parent Portal** | Parents |

### 4.2 Shared Interfaces

- Login
- Forgot Password / Reset Password
- Change Password
- User Profile
- Notifications
- Settings (role-specific)

### 4.3 Screen-by-Screen Requirements

#### 4.3.1 Login Screen

| Element | Details |
|---------|---------|
| Fields | Email / Phone, Password |
| Actions | Login, Forgot Password, Remember Me |
| Validation | Email and password required; invalid credentials show error message |
| Error States | "Invalid email or password", "Account locked after 5 failed attempts" |
| Post-Success | Redirect to role-specific dashboard |

#### 4.3.2 Super Admin Dashboard

| Widget | Description |
|--------|-------------|
| Schools Overview | Total schools, active/suspended counts |
| Recent Registrations | New schools registered in last 30 days |
| System Health | Uptime, active users, storage used |
| Quick Actions | Add School, Manage Licenses, Global Settings |

**Tables:** School List (Name, Domain, Status, Users, Created Date)

**Filters:** Status, Date Range, Plan Type

**Actions:** View, Edit, Suspend, Delete (soft)

#### 4.3.3 School Administrator Dashboard

| Widget | Description |
|--------|-------------|
| Student Count | Total enrolled, new this term |
| Pending Admissions | Count with link to approval screen |
| Revenue Summary | Total collected this month |
| Recent Activities | Last 10 actions (student added, fee paid, etc.) |
| Quick Actions | Add Student, Configure Session, Generate Reports |

**Tables:** Student List, Class List

**Filters:** Grade, Status, Section

**Actions:** Edit, View, Enable/Disable, Print

#### 4.3.4 Registrar Dashboard

| Widget | Description |
|--------|-------------|
| Students Today | Registered today |
| Pending Admissions | Awaiting document verification |
| Recent Payments | Last 10 recorded payments |
| Quick Actions | Register Student, Enroll Student, Generate Invoice |

**Tables:** Student List (Name, ID, Grade, Status, Guardian, Phone)

**Filters:** Grade, Status, Enrollment Date

**Actions:** Edit, View, Generate Invoice, Print ID Card

#### 4.3.5 Accountant Dashboard

| Widget | Description |
|--------|-------------|
| Today's Collection | Amount collected today |
| Pending Dues | Total outstanding across all students |
| Recent Transactions | Last 10 payments recorded |
| Quick Actions | Record Payment, Configure Fee Structure, Generate Report |

**Tables:** Payments (Student, Invoice #, Amount, Date, Status), Outstanding List

**Filters:** Date Range, Grade, Payment Status

**Actions:** View Receipt, Void Payment, Print Report

#### 4.3.6 Parent Portal

| Widget | Description |
|--------|-------------|
| Child Overview | Name, grade, enrollment status |
| Fee Summary | Total fees, paid, outstanding |
| Recent Payments | Last 5 payments |
| Quick Actions | View Invoices, Download Receipts |

**Tables:** Invoice List (Invoice #, Term, Amount, Due Date, Status)

**Filters:** Term, Status (Paid/Unpaid)

**Actions:** View Invoice, Download Receipt, Print

---

## 5. Functional Requirements

### 5.1 User & Access Management

#### FR-001: User Registration

| Field | Value |
|-------|-------|
| **Actor** | Super Admin |
| **Description** | Super Admin can create user accounts for school administrators |
| **Inputs** | First name, Last name, Email, Phone, Role, School assignment |
| **Validation** | Email and phone must be unique; required fields cannot be empty; email format validation |
| **Output** | User created with status Active; welcome email sent with temporary password |

#### FR-002: User Authentication

| Field | Value |
|-------|-------|
| **Actor** | All users |
| **Description** | Users log in with email/phone and password |
| **Validation** | Account must be Active; max 5 failed attempts locks account for 30 minutes |
| **Output** | JWT token returned; redirected to role-specific dashboard |
| **Error States** | Invalid credentials, account locked, account disabled |

#### FR-003: Role-Based Access Control

| Field | Value |
|-------|-------|
| **Actor** | Super Admin |
| **Description** | Permissions are assigned per role; each API endpoint and UI element enforces role checks |
| **Output** | Unauthorized access returns 403; unauthorized UI elements are hidden |

#### FR-004: Password Reset

| Field | Value |
|-------|-------|
| **Actor** | All users |
| **Description** | User requests password reset via email; receives reset link valid for 1 hour |
| **Validation** | Email must exist in system; new password must meet minimum requirements (8+ chars, 1 uppercase, 1 number) |
| **Output** | Password updated; confirmation email sent |

### 5.2 School Management

#### FR-005: Create School (Multi-School)

| Field | Value |
|-------|-------|
| **Actor** | Super Admin |
| **Inputs** | School name, domain, address, phone, email, logo, plan type, admin name, admin email, admin phone |
| **Validation** | Domain must be unique; required fields cannot be empty |
| **Output** | School created with status Active; admin user auto-created; welcome email sent |

#### FR-006: School Configuration

| Field | Value |
|-------|-------|
| **Actor** | School Administrator |
| **Description** | Configure academic sessions, terms, grade levels, class sections, fee templates |
| **Validation** | Session dates cannot overlap |
| **Output** | Configuration saved; affects all downstream processes |

### 5.3 Student Management

#### FR-007: Register Student

| Field | Value |
|-------|-------|
| **Actor** | Registrar, School Administrator |
| **Description** | Register a new student in the system |
| **Inputs** | First name, Last name, Date of birth, Gender, Guardian name, Guardian phone, Guardian email, Address, Previous school (optional), Documents (optional) |
| **Validation** | Guardian phone must be unique per school; required fields cannot be empty; DOB must be valid; guardian phone OR guardian email must be provided (parent account credentials are sent to whichever is provided) |
| **Output** | Student ID generated (auto-increment, school-prefixed format: SCH-YYYY-XXXX); status = Pending |
| **Error States** | Duplicate guardian phone; missing required fields |

#### FR-008: Student Enrollment

| Field | Value |
|-------|-------|
| **Actor** | Registrar, School Administrator |
| **Description** | Enroll a registered student into a class for a given academic session |
| **Precondition** | Student status must be Pending or Active |
| **Inputs** | Student, Class, Section, Academic session, Enrollment date |
| **Validation** | Student cannot be enrolled in same class/session twice; class must have capacity |
| **Output** | Enrollment record created; student status updated to Active; fee invoice auto-generated |
| **Error States** | Class at full capacity; student already enrolled in session |

#### FR-009: Student Document Management

| Field | Value |
|-------|-------|
| **Actor** | Registrar |
| **Description** | Upload and manage student documents (birth certificate, transcripts, etc.) |
| **Validation** | Max file size 5MB; allowed types: PDF, JPG, PNG |
| **Output** | Document stored; linked to student profile |
| **Error States** | File too large; unsupported file type |

#### FR-010: Student Status Management

| Field | Value |
|-------|-------|
| **Actor** | School Administrator |
| **Description** | Change student status: Active, Suspended, Expelled, Graduated, Transferred |
| **Business Rule** | Status changes are logged; a reason is required for Suspended/Expelled |
| **Output** | Status updated; audit trail created; parent notified |

### 5.4 Fee Management

#### FR-011: Configure Fee Structure

| Field | Value |
|-------|-------|
| **Actor** | Accountant, School Administrator |
| **Inputs** | Fee name, Amount, Grade/Class, Term, Due date, Frequency (termly/yearly), Late fee penalty, Discount eligibility |
| **Validation** | Amount must be positive; due date must be in the future |
| **Output** | Fee structure saved and applied to future invoice generation |
| **Error States** | Duplicate fee name for same grade/term |

#### FR-012: Generate Fee Invoice

| Field | Value |
|-------|-------|
| **Actor** | System (auto), Registrar |
| **Description** | Automatically generate invoice upon enrollment; manual generation also supported. For mid-term enrollments, the invoice amount is prorated based on the remaining term duration |
| **Inputs** | Student, Fee structure, Term, Due date, Proration factor (auto-calculated for mid-term) |
| **Validation** | No duplicate invoice for same student/term/fee type |
| **Business Logic** | Proration formula: `prorated_amount = full_amount × (remaining_days / total_term_days)` where remaining_days = max(0, term_end_date - enrollment_date). Proration only applies when enrollment_date > term_start_date |
| **Output** | Invoice created with status = Unpaid; unique invoice number generated (INV-YYYY-XXXX); invoice `notes` field indicates proration details if applicable |
| **Error States** | Invoice already exists for this term |

#### FR-013: Record Payment

| Field | Value |
|-------|-------|
| **Actor** | Accountant |
| **Description** | Record a payment against an invoice |
| **Inputs** | Invoice number, Amount paid, Payment method (Cash/Bank Transfer/Card/Cheque), Payment date, Reference/transaction ID, Notes |
| **Validation** | Payment amount cannot exceed outstanding balance; invoice must be Unpaid or Partially Paid |
| **Output** | Payment recorded; invoice status updated (Paid or Partially Paid); receipt generated; financial records updated |
| **Business Rule** | Payment receipts are immutable after issuance; a void/cancel process is required for corrections. When a payment is voided, the system must: (1) set payment status to Voided, (2) subtract the voided amount from invoice `paid_amount`, (3) recalculate invoice `outstanding_amount`, (4) revert `payment_status` to `Partially Paid` if `paid_amount > 0` after reversal, or `Unpaid` if `paid_amount == 0`, (5) log all changes in the audit trail |
| **Error States** | Payment exceeds outstanding amount; invoice already fully paid |

#### FR-014: Partial Payments

| Field | Value |
|-------|-------|
| **Actor** | Accountant |
| **Description** | Accept partial payments against an invoice; invoice status becomes Partially Paid |
| **Business Rule** | Partial payments are allowed; outstanding balance recalculated; no partial payment can be less than minimum threshold (configurable) |
| **Output** | Payment recorded; invoice status updated; receipt issued for partial amount |

#### FR-015: Discounts & Scholarships

| Field | Value |
|-------|-------|
| **Actor** | School Administrator |
| **Description** | Apply discounts or scholarships to a student's fee |
| **Inputs** | Student, Discount type (Percentage/Fixed), Value, Reason, Validity period |
| **Validation** | Percentage cannot exceed 100%; fixed amount cannot exceed total fee |
| **Output** | Discount applied; invoice recalculated |
| **Business Rule** | Discounts require administrator approval |

#### FR-016: Receipt Generation

| Field | Value |
|-------|-------|
| **Actor** | System |
| **Description** | Auto-generate receipt upon successful payment confirmation |
| **Output** | Receipt with: Receipt number, Student name, Invoice number, Amount paid, Balance, Payment method, Date, School name, Payment breakdown |

#### FR-017: Outstanding Balance Tracking

| Field | Value |
|-------|-------|
| **Actor** | System |
| **Description** | Track unpaid and partially paid invoices; auto-calculate total outstanding per student |
| **Business Rule** | Invoices past due date accrue late fee (configurable) |
| **Output** | Dashboard widgets show real-time outstanding totals; automated reminders sent weekly |

### 5.5 Financial Management

#### FR-018: Income Tracking

| Field | Value |
|-------|-------|
| **Actor** | Accountant |
| **Description** | View all income sources: fee payments, registration fees, other income |
| **Output** | Income report with date range filtering, category breakdown, totals |

#### FR-019: Expense Management (Post-MVP)

| Field | Value |
|-------|-------|
| **Actor** | Accountant |
| **Description** | Record and categorize school expenses |
| **Inputs** | Expense category, Amount, Date, Description, Vendor, Receipt attachment |
| **Validation** | Amount must be positive |
| **Output** | Expense recorded; financial reports updated |

#### FR-020: Financial Reporting

| Field | Value |
|-------|-------|
| **Actor** | Accountant, School Administrator |
| **Description** | Generate financial reports: revenue summary, fee collection report, outstanding report, daily collection report |
| **Output** | Downloadable as PDF/CSV; date range and grade filters |

### 5.6 Parent Portal

#### FR-021: Parent Registration / Linking

| Field | Value |
|-------|-------|
| **Actor** | Registrar, System |
| **Description** | Parent account is auto-created during student registration using guardian phone/email; parent receives login credentials via SMS/email |
| **Business Rule** | A parent account can be linked to multiple children |
| **Output** | Parent account created with role = Parent; linked to student record |

#### FR-022: View Invoices

| Field | Value |
|-------|-------|
| **Actor** | Parent |
| **Description** | View all invoices for linked children |
| **Business Rule** | Parent can only view invoices for their own children; cannot view invoices of other students |
| **Output** | Invoice list with status, amount, due date; filterable by term and status |

#### FR-023: Download Receipt

| Field | Value |
|-------|-------|
| **Actor** | Parent |
| **Description** | Download payment receipt as PDF |
| **Business Rule** | Receipts are read-only and cannot be modified |
| **Output** | PDF receipt downloaded |

### 5.7 Reporting

#### FR-024: Student Enrollment Report

| Field | Value |
|-------|-------|
| **Actor** | School Administrator, Super Admin |
| **Filters** | Grade, Session, Date range, Status |
| **Output** | Table and chart with enrollment counts; exportable to PDF/CSV |

#### FR-025: Fee Collection Report

| Field | Value |
|-------|-------|
| **Actor** | Accountant, School Administrator |
| **Filters** | Date range, Grade, Term, Payment method |
| **Output** | Total collected, outstanding, collection rate; exportable to PDF/CSV |

#### FR-026: Outstanding Dues Report

| Field | Value |
|-------|-------|
| **Actor** | Accountant, School Administrator |
| **Filters** | Grade, Term, Due date range |
| **Output** | List of students with outstanding balances; total overdue amount |

---

## 6. User Stories

| ID | Role | Want To | So That |
|----|------|---------|---------|
| US-001 | Super Admin | Create a new school | The school can start using the system |
| US-002 | Super Admin | View all schools | I can monitor platform adoption |
| US-003 | School Admin | Configure academic sessions | I can organize the school calendar |
| US-004 | Registrar | Register a student | The student can be enrolled |
| US-005 | Registrar | Upload student documents | I have a complete record |
| US-006 | Registrar | Enroll a student in a class | The student can attend |
| US-007 | Registrar | Generate a fee invoice | The parent knows what to pay |
| US-008 | Accountant | Configure fee structures | Invoices are calculated correctly |
| US-009 | Accountant | Record a payment | The invoice is marked as paid |
| US-010 | Accountant | Generate a receipt | The parent has proof of payment |
| US-011 | Accountant | View outstanding dues | I can follow up with parents |
| US-012 | Parent | View my child's invoices | I know what I owe |
| US-013 | Parent | Download a receipt | I have proof of payment |
| US-014 | Parent | View payment history | I can track what I've paid |
| US-015 | School Admin | Generate a fee collection report | I can review financial performance |
| US-016 | School Admin | See the dashboard | I can monitor school operations at a glance |

---

## 7. Acceptance Criteria

### AC-001: Student Registration

```
Given I am logged in as a Registrar
When I navigate to the Register Student page
And I fill in all required fields with valid data
And I click Submit
Then a new student record is created
And a student ID is generated in the format SCH-YYYY-XXXX
And the student status is Pending
And a success message "Student registered successfully" is displayed
And the guardian receives a welcome SMS
```

### AC-002: Student Registration — Duplicate Guardian Phone

```
Given I am logged in as a Registrar
When I submit a student form with a guardian phone that already exists in the school
Then I see an error message "A student with this guardian phone already exists"
And the form is not submitted
```

### AC-003: Student Registration — Missing Required Fields

```
Given I am logged in as a Registrar
When I submit the student form with empty required fields
Then each empty required field shows a red border
And an error message "This field is required" is displayed below each empty field
And the form is not submitted
```

### AC-004: Record Payment — Full Payment

```
Given I am logged in as an Accountant
And there is an invoice with status Unpaid for $500
When I record a payment of $500
And I select a payment method
And I click Confirm
Then the payment is recorded
And the invoice status changes to Paid
And a receipt is generated with a unique receipt number
And the student's outstanding balance becomes $0
```

### AC-005: Record Payment — Partial Payment

```
Given I am logged in as an Accountant
And there is an invoice with status Unpaid for $500
When I record a payment of $200
Then the payment is recorded
And the invoice status changes to Partially Paid
And the outstanding balance is $300
And a receipt for $200 is generated
```

### AC-006: Record Payment — Overpayment

```
Given I am logged in as an Accountant
And there is an invoice with status Unpaid for $500
When I record a payment of $600
Then I see an error message "Payment amount cannot exceed outstanding balance"
And the payment is not recorded
```

### AC-007: Parent View Invoices

```
Given I am logged in as a Parent
And my child has 3 invoices (2 Paid, 1 Unpaid)
When I navigate to the Invoices page
Then I see all 3 invoices
And each invoice shows: invoice number, term, amount, due date, status
And the Unpaid invoice is highlighted
And I do NOT see invoices for any other student
```

### AC-008: Unauthorized Access

```
Given I am logged in as a Parent
When I attempt to navigate to /accountant/dashboard
Then I receive a 403 Forbidden response
And I am redirected to my dashboard
```

### AC-009: Invoice Auto-Generation on Enrollment

```
Given a student is enrolled in a class for Term 1
And the fee structure exists for that class and term
When the enrollment is confirmed
Then a fee invoice is automatically generated
And the invoice status is Unpaid
And the invoice amount matches the configured fee structure
```

### AC-010: Password Reset

```
Given I am on the Login page
When I click "Forgot Password"
And I enter my registered email
And I click Send Reset Link
Then a reset link is sent to my email
And the link is valid for 1 hour
When I click the link
And I enter a new password meeting requirements
And I confirm the password
Then my password is updated
And I am redirected to the Login page
And I can log in with the new password
```

---

## 8. Permissions Matrix

| Feature / Action | Super Admin | School Admin | Registrar | Accountant | Parent |
|------------------|:-----------:|:------------:|:---------:|:----------:|:------:|
| Manage Schools | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Users | ✅ | ✅ (school) | ❌ | ❌ | ❌ |
| Configure System | ✅ | ✅ (school) | ❌ | ❌ | ❌ |
| Register Student | ❌ | ✅ | ✅ | ❌ | ❌ |
| View Student List | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit Student | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete Student (soft) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Enroll Student | ❌ | ✅ | ✅ | ❌ | ❌ |
| Upload Documents | ❌ | ✅ | ✅ | ❌ | ❌ |
| Configure Fee Structure | ❌ | ✅ | ❌ | ✅ | ❌ |
| Generate Invoice | ❌ | ✅ | ✅ | ✅ | ❌ |
| Record Payment | ❌ | ❌ | ❌ | ✅ | ❌ |
| Void Payment | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Receipt | ❌ | ✅ | ✅ | ✅ | ✅ (own) |
| Download Receipt | ❌ | ✅ | ✅ | ✅ | ✅ (own) |
| Apply Discount | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Outstanding | ✅ | ✅ | ✅ | ✅ | ✅ (own) |
| Generate Reports | ✅ | ✅ | ❌ | ✅ | ❌ |
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ (limited) |
| View Child Data | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 9. Business Rules

| ID | Rule |
|----|------|
| BR-001 | Student IDs are auto-generated, immutable, and cannot be changed after creation |
| BR-002 | Deleted/removed students are soft-deleted (archived), never hard-deleted from the database |
| BR-003 | Only Accountants can confirm and record payments; Registrars can generate invoices but not record payments |
| BR-004 | Parents can only access data for their own linked children, not any other student |
| BR-005 | Payment receipts are immutable after issuance; corrections require a void-and-reissue workflow |
| BR-006 | Invoices past their due date automatically accrue a late fee as per the configured fee structure |
| BR-007 | A student cannot be enrolled in the same class and session twice |
| BR-008 | A parent account can be linked to multiple children across different grades |
| BR-009 | All status changes (student, invoice, payment) must be logged in the audit trail |
| BR-010 | User accounts are locked after 5 consecutive failed login attempts for 30 minutes |
| BR-011 | Student records cannot be deleted if they have associated financial transactions |
| BR-012 | Fee discounts require dual approval (Accountant + School Administrator) when exceeding 50% |
| BR-013 | API endpoints must validate role from JWT, not from request body. The `recorded_by` field on payments is always derived from the authenticated user's ID, never from client input |

---

## 10. State Diagrams

### 10.1 Student Status

```
                  ┌──────────┐
                  │ Pending  │
                  └────┬─────┘
                       │ Enrolled
                       ▼
                  ┌──────────┐
       ┌─────────│  Active  │──────────┐
       │         └────┬─────┘          │
       │              │                │
       ▼              ▼                ▼
┌──────────┐   ┌──────────┐     ┌──────────┐
│Suspended │   │ Graduated│     │Transferred│
└──────────┘   └──────────┘     └──────────┘
       │
       ▼
  ┌──────────┐
  │ Expelled │
  └──────────┘
```

### 10.2 Invoice Status

**Design note:** Payment state (Unpaid / Partially Paid / Paid) and temporal state (Current / Overdue) are tracked separately. An invoice can be both `Partially Paid` and `Overdue` simultaneously.

```
Payment States (required):        Temporal Overlay (auto-computed):

     ┌──────────┐                  ┌──────────┐
     │  Unpaid  │                  │ Current  │  ← before due_date
     └────┬─────┘                  └──────────┘
          │
          ├──→ Partially Paid         ┌──────────┐
          │                          │ Overdue  │  ← past due_date
          ▼                          └──────────┘
     ┌──────────┐
     │   Paid   │                  Late fee accrual applies
     └────┬─────┘                  when Overdue = true,
          │                        regardless of payment state
          ▼
     ┌──────────┐
     │ Refunded │
     └──────────┘

Rules:
- Unpaid + Overdue  → late fee accrues daily
- Partially Paid + Overdue → late fee still accrues on outstanding balance
- Payment during Overdue → clears Overdue status; invoice becomes Paid or remains Partially Paid
- Paid status always resets Overdue to false and stops late fee accrual
```

### 10.3 Payment Lifecycle

```
    Recorded
       │
       ▼
  ┌─────────┐
  │ Pending │ ───→ Confirmed → Receipt Issued
  │ Conf.   │
  └────┬────┘
       │
       ▼
  ┌─────────┐
  │  Voided │ (requires admin approval + reason)
  └─────────┘
```

---

## 11. Database Requirements

### 11.1 Core Entities

#### School

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| domain | VARCHAR(255) | UNIQUE, NOT NULL |
| address | TEXT | |
| phone | VARCHAR(20) | |
| email | VARCHAR(255) | |
| logo_url | TEXT | |
| plan_type | ENUM | Free, Basic, Premium |
| status | ENUM | Active, Suspended |
| min_partial_payment_allowed | DECIMAL(12,2) | DEFAULT 0 (minimum amount accepted for partial payments) |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### User

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| school_id | UUID | FK → School |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| phone | VARCHAR(20) | UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| role | ENUM | Super Admin, Admin, Registrar, Accountant, Parent |
| status | ENUM | Active, Inactive, Locked |
| failed_attempts | INT | DEFAULT 0 |
| locked_until | TIMESTAMP | NULLABLE |
| last_login | TIMESTAMP | |
| reset_token | VARCHAR(255) | NULLABLE (password reset JWT or hash) |
| reset_token_expires_at | TIMESTAMP | NULLABLE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### Student

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| school_id | UUID | FK → School |
| student_id | VARCHAR(50) | UNIQUE (SCH-YYYY-XXXX format) |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| date_of_birth | DATE | NOT NULL |
| gender | ENUM | Male, Female, Other |
| guardian_name | VARCHAR(200) | NOT NULL |
| guardian_phone | VARCHAR(20) | NOT NULL |
| guardian_email | VARCHAR(255) | |
| address | TEXT | |
| previous_school | VARCHAR(255) | |
| status | ENUM | Pending, Active, Suspended, Expelled, Graduated, Transferred |
| status_change_reason | TEXT | NULLABLE (required when status = Suspended or Expelled) |
| parent_user_id | UUID | FK → User (NULLABLE, linked on parent registration) |
| deleted_at | TIMESTAMP | NULLABLE (soft-delete support; NULL = not deleted) |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### AcademicSession

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| school_id | UUID | FK → School |
| name | VARCHAR(100) | NOT NULL (e.g. "2024-2025") |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| status | ENUM | Active, Inactive |
| created_at | TIMESTAMP | |

#### Term

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| session_id | UUID | FK → AcademicSession |
| school_id | UUID | FK → School |
| name | VARCHAR(100) | NOT NULL (e.g. "Term 1", "Term 2") |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| status | ENUM | Active, Inactive |
| created_at | TIMESTAMP | |

#### Class

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| school_id | UUID | FK → School |
| name | VARCHAR(100) | NOT NULL (e.g. "Grade 5") |
| capacity | INT | |
| created_at | TIMESTAMP | |

#### Enrollment

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| student_id | UUID | FK → Student |
| class_id | UUID | FK → Class |
| session_id | UUID | FK → AcademicSession |
| enrollment_date | DATE | NOT NULL |
| status | ENUM | Active, Completed, Withdrawn |
| created_at | TIMESTAMP | |

#### FeeStructure

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| school_id | UUID | FK → School |
| name | VARCHAR(200) | NOT NULL |
| amount | DECIMAL(12,2) | NOT NULL |
| class_id | UUID | FK → Class (NULLABLE for school-wide fees) |
| term_id | UUID | FK → Term |
| due_date | DATE | NOT NULL |
| late_fee | DECIMAL(12,2) | DEFAULT 0 |
| late_fee_type | ENUM | Flat, Daily | DEFAULT 'Flat' (Flat = one-time penalty; Daily = accrues per day past due) |
| frequency | ENUM | Termly, Yearly |
| status | ENUM | Active, Inactive |
| created_at | TIMESTAMP | |

#### Invoice

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| invoice_no | VARCHAR(50) | UNIQUE (INV-YYYY-XXXX) |
| student_id | UUID | FK → Student |
| fee_structure_id | UUID | FK → FeeStructure |
| term_id | UUID | FK → Term |
| total_amount | DECIMAL(12,2) | NOT NULL |
| discount_amount | DECIMAL(12,2) | DEFAULT 0 |
| late_fee_amount | DECIMAL(12,2) | DEFAULT 0 |
| net_amount | DECIMAL(12,2) | NOT NULL |
| paid_amount | DECIMAL(12,2) | DEFAULT 0 |
| outstanding_amount | DECIMAL(12,2) | DEFAULT 0 |
| payment_status | ENUM | Unpaid, Partially Paid, Paid, Refunded |
| temporal_status | ENUM | Current, Overdue |
| due_date | DATE | NOT NULL |
| issued_date | DATE | NOT NULL |
| notes | TEXT | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### Payment

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| invoice_id | UUID | FK → Invoice |
| receipt_no | VARCHAR(50) | UNIQUE |
| amount | DECIMAL(12,2) | NOT NULL |
| payment_method | ENUM | Cash, Bank Transfer, Card, Cheque |
| reference_id | VARCHAR(255) | |
| payment_date | DATE | NOT NULL |
| recorded_by | UUID | FK → User |
| status | ENUM | Pending, Confirmed, Voided |
| void_reason | TEXT | |
| notes | TEXT | |
| created_at | TIMESTAMP | |

#### AuditLog

| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PK |
| school_id | UUID | FK → School |
| user_id | UUID | FK → User |
| action | VARCHAR(100) | NOT NULL |
| entity_type | VARCHAR(50) | NOT NULL |
| entity_id | UUID | |
| old_values | JSONB | |
| new_values | JSONB | |
| ip_address | VARCHAR(45) | |
| created_at | TIMESTAMP | |

### 11.2 Entity Relationships

```
School 1──N User
School 1──N Student
School 1──N AcademicSession
School 1──N Class
School 1──N FeeStructure

Student 1──N Enrollment
Class 1──N Enrollment
AcademicSession 1──N Enrollment

Student 1──N Invoice
FeeStructure 1──N Invoice
Invoice 1──N Payment
User 1──N Payment (recorded_by)

Student N──1 User (parent_user_id)
```

---

### 11.3 Prisma Schema (`prisma/schema.prisma`)

The following Prisma schema serves as the reference implementation for all database migrations. It maps directly to the logical schema defined above, with added Prisma-specific conventions for multi-tenant isolation and financial precision.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==========================================
// ENUMS
// ==========================================

enum UserRole {
  SUPER_ADMIN
  ADMIN
  REGISTRAR
  ACCOUNTANT
  PARENT
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum StudentStatus {
  PENDING
  ACTIVE
  SUSPENDED
  EXPELLED
  GRADUATED
  TRANSFERRED
}

enum PaymentStatus {
  UNPAID
  PARTIALLY_PAID
  PAID
  REFUNDED
}

enum TemporalStatus {
  CURRENT
  OVERDUE
}

enum LateFeeType {
  FLAT
  DAILY
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
  CARD
  CHEQUE
}

// ==========================================
// SYSTEM & TENANCY
// ==========================================

model School {
  id                      String    @id @default(uuid())
  name                    String
  address                 String?
  minPartialPaymentAllowed Decimal  @default(0.00) @db.Decimal(12, 2)
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt
  deletedAt               DateTime?

  users          User[]
  academicSessions AcademicSession[]
  classes        Class[]
  students       Student[]
  feeStructures  FeeStructure[]
  invoices       Invoice[]

  @@index([deletedAt])
}

model User {
  id                String    @id @default(uuid())
  schoolId          String?
  email             String    @unique
  phone             String?   @unique
  passwordHash      String
  firstName         String
  lastName          String
  role              UserRole
  status            String    @default("Active")
  failedAttempts    Int       @default(0)
  lockedUntil       DateTime?
  lastLogin         DateTime?
  resetToken        String?   @unique
  resetTokenExpires DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime?

  school            School?   @relation(fields: [schoolId], references: [id])
  paymentsRecorded  Payment[]

  @@index([schoolId])
  @@index([role])
  @@index([deletedAt])
}

// ==========================================
// ACADEMIC
// ==========================================

model AcademicSession {
  id        String   @id @default(uuid())
  schoolId  String
  name      String
  startDate DateTime
  endDate   DateTime
  status    String   @default("Active")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  school    School   @relation(fields: [schoolId], references: [id])
  terms     Term[]

  @@index([schoolId])
}

model Term {
  id                String   @id @default(uuid())
  academicSessionId String
  name              String
  startDate         DateTime
  endDate           DateTime
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?

  academicSession   AcademicSession @relation(fields: [academicSessionId], references: [id])
  feeStructures     FeeStructure[]
  invoices          Invoice[]

  @@index([academicSessionId])
}

model Class {
  id        String   @id @default(uuid())
  schoolId  String
  name      String
  capacity  Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  school    School   @relation(fields: [schoolId], references: [id])

  @@index([schoolId])
}

model Enrollment {
  id             String   @id @default(uuid())
  studentId      String
  classId        String
  sessionId      String
  enrollmentDate DateTime
  status         String   @default("Active")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  student        Student         @relation(fields: [studentId], references: [id])
  class          Class           @relation(fields: [classId], references: [id])
  session        AcademicSession @relation(fields: [sessionId], references: [id])

  @@index([studentId])
  @@index([classId])
  @@index([sessionId])
}

// ==========================================
// STUDENT
// ==========================================

model Student {
  id                 String        @id @default(uuid())
  schoolId           String
  studentId          String        @unique
  firstName          String
  lastName           String
  dateOfBirth        DateTime
  gender             Gender
  guardianName       String
  guardianPhone      String?
  guardianEmail      String?
  address            String?
  previousSchool     String?
  status             StudentStatus @default(PENDING)
  statusChangeReason String?       @db.Text
  parentUserId       String?
  deletedAt          DateTime?

  school             School        @relation(fields: [schoolId], references: [id])
  invoices           Invoice[]

  @@index([schoolId])
  @@index([status])
  @@index([deletedAt])
}

// ==========================================
// FINANCIAL
// ==========================================

model FeeStructure {
  id           String      @id @default(uuid())
  schoolId     String
  termId       String
  name         String
  baseAmount   Decimal     @db.Decimal(12, 2)
  dueDate      DateTime
  lateFeeRate  Decimal     @default(0.00) @db.Decimal(12, 2)
  lateFeeType  LateFeeType @default(FLAT)
  frequency    String      @default("Termly")
  status       String      @default("Active")
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  deletedAt    DateTime?

  school       School      @relation(fields: [schoolId], references: [id])
  term         Term        @relation(fields: [termId], references: [id])
  invoices     Invoice[]

  @@index([schoolId])
  @@index([termId])
}

model Invoice {
  id                 String         @id @default(uuid())
  invoiceNo          String         @unique
  schoolId           String
  studentId          String
  feeStructureId     String
  termId             String
  totalAmount        Decimal        @db.Decimal(12, 2)
  discountAmount     Decimal        @default(0.00) @db.Decimal(12, 2)
  lateFeeAmount      Decimal        @default(0.00) @db.Decimal(12, 2)
  netAmount          Decimal        @db.Decimal(12, 2)
  paidAmount         Decimal        @default(0.00) @db.Decimal(12, 2)
  outstandingAmount  Decimal        @db.Decimal(12, 2)
  dueDate            DateTime
  issuedDate         DateTime       @default(now())
  paymentStatus      PaymentStatus  @default(UNPAID)
  temporalStatus     TemporalStatus @default(CURRENT)
  notes              String?
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt
  deletedAt          DateTime?

  school             School         @relation(fields: [schoolId], references: [id])
  student            Student        @relation(fields: [studentId], references: [id])
  feeStructure       FeeStructure   @relation(fields: [feeStructureId], references: [id])
  term               Term           @relation(fields: [termId], references: [id])
  payments           Payment[]

  @@index([schoolId])
  @@index([studentId])
  @@index([paymentStatus, temporalStatus])
  @@index([deletedAt])
}

model Payment {
  id            String        @id @default(uuid())
  receiptNo     String        @unique
  invoiceId     String
  amount        Decimal       @db.Decimal(12, 2)
  paymentMethod PaymentMethod
  paymentDate   DateTime      @default(now())
  referenceId   String?
  recordedById  String
  status        String        @default("Confirmed")
  voidReason    String?       @db.Text
  notes         String?       @db.Text
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  invoice       Invoice       @relation(fields: [invoiceId], references: [id])
  recordedBy    User          @relation(fields: [recordedById], references: [id])

  @@index([invoiceId])
  @@index([recordedById])
}

model AuditLog {
  id          BigInt   @id @default(autoincrement())
  schoolId    String?
  userId      String?
  action      String
  entityType  String
  entityId    String?
  oldValues   Json?
  newValues   Json?
  ipAddress   String?
  createdAt   DateTime @default(now())

  @@index([schoolId])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

**Multi-tenancy enforcement:** Every tenant-scoped model includes `schoolId`. A global Prisma middleware filter injects `where: { schoolId: <from JWT> }` on all queries except for Super Admin and cross-school operations.

**Financial precision:** All monetary fields use `@db.Decimal(12, 2)` — never `Float` or `Int` — to prevent floating-point rounding errors in fee calculations, late fee accrual, and invoice totals.

---

### 11.4 Database Seed Script (`prisma/seed.ts`)

The seed script populates the database with realistic tenant data, test credentials, and edge-case financial records for immediate validation. It is idempotent (clears existing data before seeding) and uses a single transaction where possible.

**Prerequisites in `package.json`:**

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

```typescript
import {
  PrismaClient,
  UserRole,
  Gender,
  StudentStatus,
  LateFeeType,
  PaymentStatus,
  TemporalStatus,
  PaymentMethod,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding pool...');

  // Idempotent cleanup (order respects FK constraints)
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.feeStructure.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.term.deleteMany({});
  await prisma.academicSession.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.school.deleteMany({});

  console.log('🧹 Cleaned up old database tables.');

  const SALT_ROUNDS = 10;
  const defaultPasswordHash = await bcrypt.hash('Password123!', SALT_ROUNDS);

  // ── Super Admin (global, no school) ──────────────────────
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@nexasoft.sms',
      passwordHash: defaultPasswordHash,
      firstName: 'Khalid',
      lastName: 'Girma',
      role: UserRole.SUPER_ADMIN,
    },
  });
  console.log(`🚀 Super Admin: ${superAdmin.email}`);

  // ── Tenant School ────────────────────────────────────────
  const school = await prisma.school.create({
    data: {
      name: 'NexaSoft Academy (Addis Ababa)',
      address: 'Bole Road, Addis Ababa, Ethiopia',
      minPartialPaymentAllowed: 500.00,
    },
  });
  console.log(`🏢 School: ${school.name} (${school.id})`);

  // ── Staff Users ──────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'admin@nexasoft.sms',
      passwordHash: defaultPasswordHash,
      firstName: 'Abebe',
      lastName: 'Kebede',
      role: UserRole.ADMIN,
    },
  });

  const registrar = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'registrar@nexasoft.sms',
      passwordHash: defaultPasswordHash,
      firstName: 'Chaltu',
      lastName: 'Yosef',
      role: UserRole.REGISTRAR,
    },
  });

  const accountant = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'accountant@nexasoft.sms',
      passwordHash: defaultPasswordHash,
      firstName: 'Tariku',
      lastName: 'Shiferaw',
      role: UserRole.ACCOUNTANT,
    },
  });

  console.log('👥 Staff: Admin, Registrar, Accountant');

  // ── Parent User ──────────────────────────────────────────
  const parent = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'parent@nexasoft.sms',
      passwordHash: defaultPasswordHash,
      firstName: 'Tesfaye',
      lastName: 'Alemu',
      role: UserRole.PARENT,
    },
  });

  // ── Academic Session & Terms ─────────────────────────────
  const session = await prisma.academicSession.create({
    data: {
      schoolId: school.id,
      name: '2026/2027 Academic Year',
      startDate: new Date('2026-09-01T00:00:00Z'),
      endDate: new Date('2027-06-30T00:00:00Z'),
      status: 'Active',
    },
  });

  const term1 = await prisma.term.create({
    data: {
      academicSessionId: session.id,
      name: 'Term 1',
      startDate: new Date('2026-09-01T00:00:00Z'),
      endDate: new Date('2026-12-25T00:00:00Z'),
    },
  });

  const term2 = await prisma.term.create({
    data: {
      academicSessionId: session.id,
      name: 'Term 2',
      startDate: new Date('2027-01-05T00:00:00Z'),
      endDate: new Date('2027-06-30T00:00:00Z'),
    },
  });

  console.log('📅 Session: 2026/2027, 2 Terms');

  // ── Classes ──────────────────────────────────────────────
  const grade10 = await prisma.class.create({
    data: { schoolId: school.id, name: 'Grade 10', capacity: 40 },
  });
  const grade3 = await prisma.class.create({
    data: { schoolId: school.id, name: 'Grade 3', capacity: 35 },
  });

  // ── Fee Structures ──────────────────────────────────────
  const highSchoolFee = await prisma.feeStructure.create({
    data: {
      schoolId: school.id,
      termId: term1.id,
      name: 'Grade 10 Tuition Fee',
      baseAmount: 12000.00,
      dueDate: new Date('2026-09-15T00:00:00Z'),
      lateFeeRate: 50.00,
      lateFeeType: LateFeeType.DAILY,
    },
  });

  const elementaryFee = await prisma.feeStructure.create({
    data: {
      schoolId: school.id,
      termId: term1.id,
      name: 'Grade 3 Tuition Fee',
      baseAmount: 8500.00,
      dueDate: new Date('2026-09-10T00:00:00Z'),
      lateFeeRate: 200.00,
      lateFeeType: LateFeeType.FLAT,
    },
  });

  console.log('💰 Fee Structures: DAILY (Grade 10) + FLAT (Grade 3)');

  // ── Students ─────────────────────────────────────────────
  const student1 = await prisma.student.create({
    data: {
      schoolId: school.id,
      firstName: 'Almaz',
      lastName: 'Tesfaye',
      dateOfBirth: new Date('2011-04-12T00:00:00Z'),
      gender: Gender.FEMALE,
      guardianName: 'Tesfaye Alemu',
      guardianPhone: '+251911223344',
      guardianEmail: 'tesfaye@example.com',
      address: 'Kirkos Subcity, Kebele 02',
      status: StudentStatus.ACTIVE,
      parentUserId: parent.id,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      schoolId: school.id,
      firstName: 'Yonas',
      lastName: 'Bekele',
      dateOfBirth: new Date('2017-08-23T00:00:00Z'),
      gender: Gender.MALE,
      guardianName: 'Bekele Zewdu',
      guardianPhone: '+251912556677',
      guardianEmail: 'bekele@example.com',
      address: 'Yeka Subcity, House 901',
      status: StudentStatus.ACTIVE,
    },
  });

  // ── Enrollments ──────────────────────────────────────────
  await prisma.enrollment.create({
    data: {
      studentId: student1.id,
      classId: grade10.id,
      sessionId: session.id,
      enrollmentDate: new Date('2026-09-01T00:00:00Z'),
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: student2.id,
      classId: grade3.id,
      sessionId: session.id,
      enrollmentDate: new Date('2026-09-01T00:00:00Z'),
    },
  });

  console.log('🎓 Students: Almaz (Grade 10), Yonas (Grade 3)');

  // ── Invoices & Payments ──────────────────────────────────

  // Invoice A: Partially Paid, Current
  const invoiceA = await prisma.invoice.create({
    data: {
      schoolId: school.id,
      studentId: student1.id,
      feeStructureId: highSchoolFee.id,
      termId: term1.id,
      totalAmount: 12000.00,
      discountAmount: 1000.00,
      lateFeeAmount: 0.00,
      netAmount: 11000.00,
      paidAmount: 4000.00,
      outstandingAmount: 7000.00,
      dueDate: new Date('2026-09-15T00:00:00Z'),
      issuedDate: new Date('2026-09-01T00:00:00Z'),
      paymentStatus: PaymentStatus.PARTIALLY_PAID,
      temporalStatus: TemporalStatus.CURRENT,
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoiceA.id,
      recordedById: accountant.id,
      amount: 4000.00,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      referenceId: 'CBE-TXN-98213A',
      notes: 'Initial partial payment.',
    },
  });

  // Invoice B: Unpaid, Overdue (target for late-fee cron)
  await prisma.invoice.create({
    data: {
      schoolId: school.id,
      studentId: student2.id,
      feeStructureId: elementaryFee.id,
      termId: term1.id,
      totalAmount: 8500.00,
      discountAmount: 0.00,
      lateFeeAmount: 200.00,
      netAmount: 8700.00,
      paidAmount: 0.00,
      outstandingAmount: 8700.00,
      dueDate: new Date('2026-09-10T00:00:00Z'),
      issuedDate: new Date('2026-09-01T00:00:00Z'),
      paymentStatus: PaymentStatus.UNPAID,
      temporalStatus: TemporalStatus.OVERDUE,
    },
  });

  console.log('💳 Invoices: Partially Paid (Almaz) + Overdue (Yonas)');
  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

**Execution:**

```bash
npx prisma db seed
```

**Seed data coverage:**

| Entity | Records | Purpose |
|--------|---------|---------|
| School | 1 | Tenant isolation test |
| Users | 5 | One per role (Super Admin, Admin, Registrar, Accountant, Parent) |
| Academic Session | 1 | With 2 terms |
| Classes | 2 | Grade 10, Grade 3 |
| Fee Structures | 2 | One FLAT, one DAILY (Section 24 validation) |
| Students | 2 | Linked to parent, enrolled in classes |
| Invoices | 2 | Partially Paid + Current, Unpaid + Overdue |
| Payments | 1 | Historical partial payment trace |

---

## 12. API Requirements (High-Level)

### 12.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/login | User login |
| POST | /api/v1/auth/forgot-password | Request password reset |
| POST | /api/v1/auth/reset-password | Reset password with token |
| POST | /api/v1/auth/refresh | Refresh JWT token |
| POST | /api/v1/auth/logout | Invalidate session |

### 12.2 Schools (Super Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/schools | List all schools |
| POST | /api/v1/schools | Create school |
| GET | /api/v1/schools/{id} | Get school details |
| PATCH | /api/v1/schools/{id} | Update school |
| DELETE | /api/v1/schools/{id} | Soft-delete school |

### 12.3 Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/students | List students (filtered by school, grade, status) |
| POST | /api/v1/students | Register student |
| GET | /api/v1/students/{id} | Get student details |
| PATCH | /api/v1/students/{id} | Update student |
| POST | /api/v1/students/{id}/documents | Upload document |
| GET | /api/v1/students/{id}/documents | Get documents |
| PATCH | /api/v1/students/{id}/status | Change student status |

### 12.4 Enrollments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/enrollments | Enroll student |
| GET | /api/v1/enrollments | List enrollments |
| GET | /api/v1/enrollments/{id} | Get enrollment details |
| PATCH | /api/v1/enrollments/{id}/status | Update enrollment status |

### 12.5 Fee & Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/fee-structures | List fee structures |
| POST | /api/v1/fee-structures | Create fee structure |
| PATCH | /api/v1/fee-structures/{id} | Update fee structure |
| GET | /api/v1/invoices | List invoices |
| POST | /api/v1/invoices | Generate invoice |
| GET | /api/v1/invoices/{id} | Get invoice details |
| POST | /api/v1/invoices/{id}/payments | Record payment |
| GET | /api/v1/invoices/{id}/payments | Get payment history |
| GET | /api/v1/payments/{id}/receipt | Download receipt |
| POST | /api/v1/payments/{id}/void | Void payment |

### 12.6 Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/reports/enrollment | Enrollment report |
| GET | /api/v1/reports/fee-collection | Fee collection report |
| GET | /api/v1/reports/outstanding | Outstanding dues report |
| GET | /api/v1/reports/daily-collection | Daily collection report |

### 12.7 Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/dashboard/stats | Role-specific dashboard data |

### 12.8 Response Format

```json
{
  "status": "success",
  "data": {},
  "message": "Student registered successfully"
}
```

```json
{
  "status": "error",
  "error": {
    "code": "DUPLICATE_GUARDIAN_PHONE",
    "message": "A student with this guardian phone already exists",
    "field": "guardian_phone"
  }
}
```

---

### 12.9 Authentication Implementation (NestJS/Express)

#### 12.9.1 Token Architecture

| Token | Storage | Lifetime | Purpose |
|-------|---------|----------|---------|
| Access Token (JWT) | React state (memory) | 15 minutes | Authorizes API requests |
| Refresh Token | HTTP-only cookie | 7 days | Obtains new access tokens silently |

**JWT Payload Shape:**

```typescript
interface JwtPayload {
  sub: string;          // User ID
  schoolId: string;     // Tenant isolation key
  role: UserRole;       // RBAC enforcement
  email: string;
  iat: number;
  exp: number;
}
```

#### 12.9.2 Auth Controller Endpoints

**POST /api/v1/auth/login**

```typescript
async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
  // 1. Find user by email
  // 2. Compare password hash (bcrypt)
  // 3. If failed: increment failedAttempts; if >= 5, set lockedUntil (30 min)
  // 4. If locked: return 423 ACCOUNT_LOCKED
  // 5. If success: reset failedAttempts to 0, update lastLogin
  // 6. Sign JWT with sub, schoolId, role, email (exp: 15 min)
  // 7. Sign refresh token (exp: 7 days), set as HTTP-only cookie
  // 8. Return { accessToken }
}
```

**POST /api/v1/auth/refresh**

```typescript
async refresh(@Cookie('refreshToken') token: string): Promise<{ accessToken: string }> {
  // 1. Verify refresh token signature and expiry
  // 2. Look up user; ensure account is Active
  // 3. Issue new access token
  // 4. Optionally rotate refresh token
}
```

**POST /api/v1/auth/forgot-password**

```typescript
async forgotPassword(@Body() dto: { email: string }): Promise<void> {
  // 1. Find user by email (return silently if not found — security best practice)
  // 2. Generate crypto-random token
  // 3. Store hash in user.resetToken, set user.resetTokenExpires (now + 1 hour)
  // 4. Send email with reset link containing raw token
}
```

**POST /api/v1/auth/reset-password**

```typescript
async resetPassword(@Body() dto: { token: string; password: string }): Promise<void> {
  // 1. Hash the incoming token
  // 2. Find user where resetToken matches hash AND resetTokenExpires > now
  // 3. Validate password strength (8+ chars, 1 uppercase, 1 number)
  // 4. Hash new password, update user.passwordHash
  // 5. Clear resetToken and resetTokenExpires
  // 6. Invalidate all existing sessions (optional: rotate JWT secret)
}
```

#### 12.9.3 JWT Auth Guard (NestJS)

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    try {
      const token = authHeader.split(' ')[1];
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload; // Attach JwtPayload to request
      return true;
    } catch {
      throw new UnauthorizedException('Token expired or invalid');
    }
  }
}
```

#### 12.9.4 Roles Guard

```typescript
import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// Usage on a controller method:
// @Roles(UserRole.ADMIN, UserRole.REGISTRAR)
// @UseGuards(JwtAuthGuard, RolesGuard)
```

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

#### 12.9.5 Tenant Isolation Middleware

A global NestJS interceptor injects `schoolId` from the JWT payload into every Prisma query:

```typescript
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    // Attach schoolId to request for controller use
    request.schoolId = user.schoolId;

    return next.handle();
  }
}
```

Prisma client middleware enforces tenant scoping on all read/write operations:

```typescript
prisma.$use(async (params, next) => {
  // Skip for super admin
  // Inject where.schoolId = request.schoolId for all tenant-scoped models
  return next(params);
});
```

#### 12.9.6 DTO Validation (Zod)

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
```

---

## 13. Error States & Handling

| Scenario | HTTP Code | Error Code | Behavior |
|----------|-----------|------------|----------|
| Missing required fields | 422 | VALIDATION_ERROR | Field-level error messages returned; form not submitted |
| Duplicate guardian phone | 409 | DUPLICATE_GUARDIAN_PHONE | Error message displayed; form not submitted |
| Duplicate email | 409 | DUPLICATE_EMAIL | Error message displayed |
| Invalid credentials | 401 | INVALID_CREDENTIALS | "Invalid email or password" message |
| Account locked | 423 | ACCOUNT_LOCKED | "Account locked. Try again in 30 minutes." |
| Account disabled | 403 | ACCOUNT_DISABLED | "Account disabled. Contact administrator." |
| Unauthorized access | 403 | FORBIDDEN | "You do not have permission to perform this action" |
| Invoice already paid | 409 | INVOICE_ALREADY_PAID | "Invoice is already fully paid" |
| Payment exceeds outstanding | 422 | PAYMENT_EXCEEDS_OUTSTANDING | "Payment amount cannot exceed outstanding balance" |
| Class at full capacity | 409 | CLASS_FULL | "Class has reached maximum capacity" |
| Student already enrolled | 409 | DUPLICATE_ENROLLMENT | "Student is already enrolled in this session" |
| File too large | 413 | FILE_TOO_LARGE | "File size exceeds 5MB limit" |
| Invalid file type | 415 | INVALID_FILE_TYPE | "Only PDF, JPG, and PNG files are allowed" |
| Invoice not found | 404 | NOT_FOUND | "Invoice not found" |
| Student not found | 404 | NOT_FOUND | "Student not found" |
| Payment gateway failure | 502 | GATEWAY_ERROR | "Payment processing failed. Please try again." |
| Rate limit exceeded | 429 | RATE_LIMITED | "Too many requests. Please try again later." |

### Error Response Format

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fields": {
      "first_name": "This field is required",
      "guardian_phone": "A student with this guardian phone already exists"
    }
  }
}
```

---

## 14. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Student transfers to another school | Student status = Transferred; enrollment closed; invoices finalized; data archived for the original school |
| Parent has multiple children | Single parent account linked to multiple student records; parent sees all children in portal |
| Parent has children in different schools | Parent account is per-school; separate login or school selector required |
| Partial payments across multiple invoices | Each payment is applied to a specific invoice; cross-invoice payments not supported in MVP |
| Full scholarship student | Discount of 100% applied; invoice shows $0; no payment required |
| Refund after overpayment | Void original payment; create refund record; accountant must approve |
| Duplicate registration attempt | Guardian phone check prevents duplicate registration; if same student is re-registered, show warning |
| Failed payment confirmation | Payment remains in Pending status; retry mechanism; admin can manually confirm |
| Student re-enrolls after graduation | New enrollment record created; previous records preserved for historical reporting |
| Mid-term enrollment | Fee invoice is prorated based on remaining term duration |
| Late fee accrual | System batch job runs daily; applies late fee to overdue invoices |
| Bulk operations | Admin can select multiple students for bulk invoice generation, status update, or report export |
| Deleted parent account | Student record is unlinked from parent; new parent can be linked; historical payments preserved |

---

## 15. Success Metrics

| Metric | Target |
|--------|--------|
| Student registration completion time | Under 2 minutes |
| Invoice generation | Under 5 seconds |
| Receipt download | Under 3 seconds |
| Dashboard page load | Under 2 seconds |
| Active student capacity per school | 10,000 students |
| Concurrent users | 500+ |
| System uptime | 99.9% |
| Payment recording accuracy | 100% (no financial discrepancies) |
| Report generation | Under 10 seconds for 10k records |
| API response time (p95) | Under 500ms |
| Data backup frequency | Daily automated |
| Recovery time objective (RTO) | Under 4 hours |
| Recovery point objective (RPO) | Under 1 hour |

---

## 16. Out of Scope (MVP)

The following features are explicitly **out of scope** for the MVP and will be addressed in future releases:

- Teacher management
- Class/subject scheduling and timetables
- Attendance tracking
- Exam management and grade entry
- Homework / assignment module
- Library management
- Transport management
- Hostel management
- Online exam / quiz platform
- Mobile applications (Android/iOS)
- Integration with Google Classroom, Zoom, or third-party LMS
- AI-powered analytics or predictions
- Multi-language support
- Custom branding per school
- Expense/cost management
- Payroll management
- Communication/notification system (in-app messaging, bulk SMS/email)
- Parent-teacher meeting scheduling

---

## 17. Non-Functional Requirements

| Requirement | Specification |
|-------------|---------------|
| **Performance** | Page load < 2s; API p95 response < 500ms |
| **Security** | RBAC, data encryption at rest (AES-256) & in transit (TLS 1.2+); password hashing (bcrypt); JWT with 24h expiry |
| **Scalability** | Horizontal scaling via stateless API; database read replicas for reporting |
| **Reliability** | 99.9% uptime; daily automated backups; automated failover |
| **Compliance** | FERPA, COPPA, local data privacy regulations |
| **Audit** | All mutations logged in audit trail with user, timestamp, old/new values |
| **Platform** | Web (responsive, mobile-first); supports latest 2 versions of Chrome, Firefox, Safari, Edge |

---

## 18. Technical Stack (Proposed)

| Layer | Technology |
|-------|-----------|
| Frontend | React / Next.js |
| Backend | Node.js (Express/NestJS) or Python (Django/DRF) |
| Database | PostgreSQL 15+ |
| Cache | Redis (session cache, rate limiting) |
| Authentication | JWT + refresh tokens |
| File Storage | AWS S3 / Local (MinIO) |
| Hosting | AWS / Azure / On-premise |
| SMS/Email | Twilio / SendGrid |
| Monitoring | Sentry, Prometheus + Grafana |
| CI/CD | GitHub Actions |

---

## 19. Milestones & Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Phase 1: Foundation** | 4 weeks | Database schema, user auth (login/register/reset), RBAC, multi-school support |
| **Phase 2: Student Management** | 4 weeks | Student CRUD, document upload, enrollment workflow, class management |
| **Phase 3: Fee & Financial Management** | 5 weeks | Fee structure, invoice generation (auto + manual), payment recording, receipts, partial payments, outstanding tracking |
| **Phase 4: Parent Portal** | 3 weeks | Parent dashboard, invoice view, payment history, receipt downloads, student info view |
| **Phase 5: Admin Dashboards & Reporting** | 4 weeks | All dashboards (Super Admin, Admin, Registrar, Accountant), reports (enrollment, fee collection, outstanding), data export (PDF/CSV) |
| **Phase 6: Testing & Deployment** | 2 weeks | QA, UAT, load testing, security audit, production deployment, documentation |

**Total MVP Timeline: 22 weeks**

---

## 19.5 Multi-Tenant Architecture Decision

The system will be built as a **single-database multi-tenant** architecture (shared schema with `school_id` discriminator on every table).

| Approach | Decision | Rationale |
|----------|----------|-----------|
| Database isolation | ❌ Rejected | Higher operational cost per school; harder to manage migrations across N databases |
| Schema-per-tenant | ❌ Rejected | Shared hosting providers may not support per-tenant schema creation; migration complexity |
| Shared DB + school_id | ✅ **Chosen** | All major tables include `school_id` as a FK; every query filters by `school_id` via middleware; simpler deployment, migrations, and monitoring |

**Enforcement:** The API middleware extracts `school_id` from the authenticated user's JWT and injects it as a mandatory filter on all queries. Cross-school data leakage is prevented at the query level, not just the UI level.

---

## 20. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Low user adoption | High | Training sessions, intuitive UI, onboarding support, demo data |
| Data security breach | Critical | Encryption (at rest & in transit), RBAC, regular security audits, penetration testing |
| Scope creep | Medium | Strict MVP scope, change control process, prioritize via MoSCoW |
| Performance under load | Medium | Load testing in staging, database indexing, caching (Redis), query optimization |
| Integration failures (payment) | Medium | Payment gateway redundancy, retry mechanism, manual fallback |
| Data migration from legacy systems | Medium | CSV import tool, data mapping documentation, validation scripts |

---

## 21. Wireframes (Textual Outline)

### Login Page
```
┌──────────────────────────────────┐
│  School Management System        │
│                                  │
│  Email/Phone: [______________]   │
│  Password:    [______________]   │
│                                  │
│  [✓] Remember Me                 │
│                                  │
│  [Login]                         │
│                                  │
│  Forgot Password?                │
└──────────────────────────────────┘
```

### Registrar Dashboard
```
┌──────────────────────────────────────────────────┐
│ SMS │ Dashboard │ Students │ Invoices │ Reports   │  👤 Registrar
├──────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│ │ Students │ │ Pending  │ │ Recent   │           │
│ │ Today    │ │ Admissions│ │ Payments │           │
│ │    12    │ │     5    │ │   $3,200 │           │
│ └──────────┘ └──────────┘ └──────────┘           │
│                                                   │
│ [+ Add Student]  [Generate Invoice]               │
│                                                   │
│ Students List                                      │
│ ┌─────┬───────┬──────┬────────┬──────────┬──────┐ │
│ │ ID  │ Name  │Grade │Guardian│ Status   │Action│ │
│ ├─────┼───────┼──────┼────────┼──────────┼──────┤ │
│ │ 001 │ Ahmed │ 5A   │ 055... │ Active   │ 👁 ✏ │ │
│ │ 002 │ Sara  │ 4B   │ 056... │ Pending  │ 👁 ✏ │ │
│ └─────┴───────┴──────┴────────┴──────────┴──────┘ │
│                                                   │
│ Filters: Grade [All ▼] Status [All ▼]             │
└──────────────────────────────────────────────────┘
```

### Parent Portal
```
┌──────────────────────────────────────────────────┐
│ SMS │ My Children │ Invoices │ Payments │ Profile  │  👤 Parent
├──────────────────────────────────────────────────┤
│ My Children                                        │
│ ┌──────────────────────────────────────────────┐  │
│ │ 👤 Ahmed Mohammed  •  Grade 5A  •  Active    │  │
│ │ Fee Summary: $2,500 paid  |  $500 outstanding│  │
│ │ [View Invoices]  [Download Receipts]          │  │
│ └──────────────────────────────────────────────┘  │
│                                                   │
│ Invoices                                           │
│ ┌────────┬────────┬────────┬──────────┬─────────┐ │
│ │Invoice │  Term  │ Amount │ Due Date │ Status  │ │
│ ├────────┼────────┼────────┼──────────┼─────────┤ │
│ │INV-001 │ Term 1 │ $1,500 │ 15/01/25 │  ✅ Paid │ │
│ │INV-002 │ Term 2 │ $1,500 │ 15/04/25 │  ⏳ Due  │ │
│ └────────┴────────┴────────┴──────────┴─────────┘ │
└──────────────────────────────────────────────────┘
```

---

## 23. Frontend Architecture (React / Next.js App Router)

### 23.1 Folder Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx             # FR-002: Login view
│   │   ├── forgot-password/page.tsx   # FR-004: Forgot password view
│   │   └── reset-password/page.tsx    # FR-004: Reset password view
│   │
│   ├── dashboard/
│   │   ├── layout.tsx                 # Shared layout: Extracts JWT, handles RBAC redirect
│   │   │
│   │   ├── super-admin/               # Super Admin routing space
│   │   │   ├── page.tsx               # Dashboard widgets & Overview
│   │   │   └── schools/page.tsx       # School Management CRUD
│   │   │
│   │   ├── admin/                     # School Admin routing space
│   │   │   ├── page.tsx               # Core school operations dashboard
│   │   │   ├── sessions/page.tsx      # FR-006: Academic session configs
│   │   │   └── students/page.tsx      # Status changes, approvals
│   │   │
│   │   ├── registrar/                 # Registrar routing space
│   │   │   ├── page.tsx               # Registration overview
│   │   │   ├── register/page.tsx      # FR-007: Registration multiform
│   │   │   └── enrollment/page.tsx    # FR-008: Enrollment setup
│   │   │
│   │   ├── accountant/                # Accountant routing space
│   │   │   ├── page.tsx               # Financial collections overview
│   │   │   ├── fees/page.tsx          # FR-011: Fee structure setup
│   │   │   ├── invoices/page.tsx      # FR-012/014: Invoices & Partial payments
│   │   │   └── reports/page.tsx       # Financial metrics exports
│   │   │
│   │   └── parent/                    # Parent Portal routing space
│   │       ├── page.tsx               # Linked children summary overview
│   │       ├── invoices/page.tsx      # FR-022: View & download receipts
│   │       └── profile/page.tsx       # Contact matching settings
│   │
│   ├── api/                           # Next.js local proxies / edge handlers
│   ├── layout.tsx                     # Root template html/body wrapper
│   └── page.tsx                       # Public landing page or auto-redirect to login
│
├── components/
│   ├── ui/                            # Atoms (Button, Input, Dropdown, Table, Modal)
│   ├── forms/                         # Complex form components
│   │   ├── StudentRegistrationForm.tsx
│   │   └── RecordPaymentForm.tsx
│   ├── shared/                        # Shared molecular blocks
│   │   ├── SidebarNavigation.tsx      # RBAC-aware menu rendering
│   │   ├── TopHeader.tsx              # School context & profile
│   │   └── MetricCard.tsx             # Dashboard widget layout
│   └── providers/
│       └── AuthProvider.tsx           # Global React Context for auth state
│
├── hooks/
│   ├── useAuth.ts                     # Current user, permissions, school_id
│   └── useFetch.ts                    # API wrapper with JWT interceptor
│
└── lib/
    ├── utils.ts                       # cn() classnames merger, formatting
    └── validations/
        └── schemas.ts                 # Zod validation schemas
```

### 23.2 Authentication State Flow

**Token Storage:** Short-lived Access Token (JWT) is held in React state (memory only). Refresh token is stored in an HTTP-only cookie set by the backend.

**AuthProvider context shape:**
```typescript
interface AuthUser {
  userId: string;
  schoolId: string;
  role: 'Super Admin' | 'Admin' | 'Registrar' | 'Accountant' | 'Parent';
  name: string;
  permissions: string[];
}
```

All outbound HTTP requests go through a custom fetch/axios instance that reads the JWT from context and appends `Authorization: Bearer <token>`.

### 23.3 Route Guard (`/dashboard/layout.tsx`)

The dashboard layout acts as a centralized gatekeeper. It extracts the role from the JWT and enforces that the user can only access their own role's route segment.

```typescript
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return router.push('/login');

  const currentPathSegment = pathname.split('/')[2];
  const permittedSegment = user.role.toLowerCase().replace(' ', '-');

  // Universal guard — works for Super Admin → 'super-admin' and all other roles
  if (currentPathSegment !== permittedSegment) {
    return router.push(`/dashboard/${permittedSegment}`);
  }

  return <>{children}</>;
}
```

### 23.4 Component-Level Permissions

Fine-grained action checks use the `useAuth` hook to conditionally render UI elements per the Permissions Matrix (Section 8):

```typescript
const { user } = useAuth();

{user?.role === 'Admin' && (
  <Button onClick={() => triggerVoidModal(payment.id)} variant="destructive">
    Void Payment
  </Button>
)}
```

### 23.5 Zod Validation Schemas (`src/lib/validations/schemas.ts`)

Schemas serve both client-side form validation and backend request validation.

```typescript
import { z } from 'zod';

const MAX_FILE_SIZE = 5242880; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

/**
 * FR-007: Student Registration Schema
 */
export const studentRegistrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid date of birth is required',
  }),
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: 'Please select a valid gender option' }),
  }),
  guardianName: z.string().min(1, 'Guardian name is required').max(200),
  guardianPhone: z.string().max(20).optional().or(z.literal('')),
  guardianEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  previousSchool: z.string().max(255).optional(),
  
  // FR-009: Document validation
  document: z.any().optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, 'File size exceeds 5MB limit')
    .refine(
      (file) => !file || ACCEPTED_FILE_TYPES.includes(file.type),
      'Only PDF, JPG, and PNG files are allowed'
    ),
}).refine((data) => data.guardianPhone || data.guardianEmail, {
  message: 'Either Guardian Phone or Guardian Email must be provided',
  path: ['guardianPhone'],
});

/**
 * FR-013 & FR-014: Record Payment Schema
 */
export const recordPaymentSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a numeric value' })
    .positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['Cash', 'Bank Transfer', 'Card', 'Cheque'], {
    errorMap: () => ({ message: 'Please select a valid payment method' }),
  }),
  paymentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid payment date is required',
  }),
  referenceId: z.string().max(255).optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
});
```

For multi-step forms, use Zod's `.pick()` to validate per-step:

```typescript
const step1Fields = studentRegistrationSchema.pick({
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  gender: true,
});

const result = step1Fields.safeParse(currentFormState);
if (!result.success) {
  // Pass errors to form fields
} else {
  goToNextStep();
}
```

---

## 24. Appendix: Late Fee Accrual Specification

### 24.1 Daily Cron Job Execution

- **Trigger:** Daily at `00:05:00 UTC`
- **Target:** All invoices where `temporal_status = 'Overdue'` AND `payment_status` NOT IN (`Paid`, `Refunded`)
- **Fee Type Execution:**
  - `Flat` — Apply late fee exactly once on the first day the invoice becomes overdue. Do not re-apply on subsequent runs.
  - `Daily` — Incrementally apply the late fee amount every day the invoice remains overdue.

### 24.2 Rounding Formula

All late fee calculations use precise 2-decimal rounding to prevent fractional drift:

```
late_fee_amount_new = ROUND(late_fee_amount_current + late_fee_rate, 2)
```

### 24.3 Invoice Totals Recalculation

After each late fee update, recalculate:

```
net_amount        = (total_amount + late_fee_amount) - discount_amount
outstanding_amount = net_amount - paid_amount
```

---

## 25. Glossary

| Term | Definition |
|------|-----------|
| **SMS** | School Management System |
| **RBAC** | Role-Based Access Control — permissions assigned per role |
| **MVP** | Minimum Viable Product |
| **UAT** | User Acceptance Testing |
| **JWT** | JSON Web Token — used for stateless authentication |
| **Soft Delete** | Marking a record as deleted without removing it from the database |
| **Invoice** | A statement of fees owed by a student for a given term |
| **Receipt** | A proof of payment issued after a payment is recorded |
| **Outstanding** | The unpaid balance on an invoice |
| **Partial Payment** | A payment that covers only part of the invoice total |
| **Late Fee** | A penalty applied to overdue invoices |
| **Enrollment** | The process of assigning a student to a class for an academic session |
| **Academic Session** | A defined period (e.g., 2024-2025 academic year) |
| **Term** | A subdivision of an academic session (e.g., Term 1, Term 2) |
| **Audit Trail** | A chronological record of all changes made to the system |
