# FLOWAI Expansion Specification

## 1. Purpose of This Document

This document is the source of truth for expanding FLOWAI into a complete AI-powered commerce and business-operations platform.

The implementation AI must:

- Inspect the existing code before changing it.
- Preserve working functionality unless a migration or correction is required.
- Implement real database-backed behavior instead of demo values.
- Keep customer-facing commerce separate from the internal operations dashboard.
- Make all sensitive operations secure, auditable, idempotent, and permission-checked.
- Complete one tested vertical slice at a time.
- Never claim a feature is complete when it is only mocked or scaffolded.

The target product is an online store powered by FLOWAI. Customers browse and purchase products, while FLOWAI automates customer support, order processing, inventory work, notifications, reporting, and human approvals.

---

## 2. Product Decision

Build a multi-channel commerce and customer-operations platform for a company selling business equipment and office technology.

The initial catalog may contain:

- Laptops and desktop computers
- Monitors
- Printers and scanners
- Networking equipment
- Office accessories
- Software and service plans

This product category is recommended because it gives the AI useful, verifiable work:

- Compare technical specifications.
- Recommend products within a budget.
- Check compatibility.
- Explain warranties and delivery policies.
- Answer questions from product documentation.
- Process orders and support requests.
- Detect low stock and notify staff.

The catalog must be data-driven. Do not hardcode products into frontend screens.

FLOWAI will have two connected applications:

1. A customer-facing commerce website.
2. The existing internal FLOWAI operations application, primarily used as a phone app and optionally available on web through Expo.

Both applications use the same FastAPI backend and authentication system, but they have different navigation, permissions, and user experiences.

---

## 3. Current Repository: What Already Exists

### 3.1 Backend

Location: `flowai-backend/`

Current stack:

- Python
- FastAPI
- SQLAlchemy
- SQLite for local development and tests
- PostgreSQL for production
- Redis and Celery for background jobs
- ChromaDB for document retrieval
- Pydantic schemas
- JWT access and refresh tokens
- pytest test suite

Application entry point:

- `flowai-backend/app/main.py`

API router registration:

- `flowai-backend/app/api/v1/router.py`

Existing route families include:

- `/api/v1/auth`
- `/api/v1/customers`
- `/api/v1/conversations`
- `/api/v1/documents`
- `/api/v1/agents`
- `/api/v1/users`
- `/api/v1/workflows`
- `/api/v1/workflow-templates`
- `/api/v1/jobs`
- `/api/v1/approvals`
- `/api/v1/schedules`
- `/api/v1/analytics`
- `/api/v1/notifications`
- `/api/v1/webhooks`
- `/api/v1/system`
- WebSocket routes under `/api/v1/ws`

Existing database entities include:

- User
- Role-related data
- Agent
- AgentRun
- Customer
- Conversation
- Message
- Document
- Workflow
- WorkflowRun
- WorkflowStep
- Approval
- Job
- Schedule
- Notification
- ToolCall
- Tool
- CostRecord
- AuditLog
- WebhookEvent

### 3.2 Existing backend behavior

Substantially implemented:

- User registration and login.
- JWT authentication.
- Protected API dependencies.
- Customer CRUD.
- Conversation history.
- Streaming AI responses.
- ChromaDB document retrieval and RAG context.
- Document upload, extraction, chunking, and indexing.
- Workflow graph validation.
- Workflow execution.
- Workflow runs and workflow steps.
- Workflow version publishing and rollback.
- Approval pause and resume.
- Agent planning and tool execution.
- Basic multi-agent supervisor selection.
- Celery task definitions.
- Notifications.
- Analytics endpoints.
- Webhook-triggered workflows.
- Basic observability and evaluation structures.

### 3.3 Existing backend limitations to fix or isolate

These must be addressed during the expansion:

- Email and calendar providers are in-memory demonstrations, not real providers.
- Voice transcription and text-to-speech are placeholders.
- Vision processing has fallback/demo behavior.
- Some analytics values contain hardcoded baseline values.
- The frontend condition format does not match the backend condition executor.
- The frontend Agents screen lists runs but does not create agents or start runs.
- Some role and ownership checks are incomplete.
- Refresh tokens are not currently persisted or revoked.
- Webhook secrets must not remain hardcoded.
- WebSocket ownership and authentication must be enforced.
- Queue fallback behavior must be observable and safe.
- Alembic migrations exist but startup currently relies on table creation.
- The customer endpoint currently behaves as a globally visible directory and must be redesigned for correct tenant and role ownership.

Do not hide these limitations by changing labels. Correct the behavior or document it as unavailable.

### 3.4 Frontend

Location: `flowai-frontend/`

Current stack:

- Expo 54
- React Native
- JavaScript
- Expo Router
- React Navigation Drawer
- AsyncStorage and SecureStore dependencies
- Redux Toolkit dependencies
- Expo document and image picker dependencies
- Expo notifications dependencies

Current route groups include:

- `app/(auth)/`
- `app/(dashboard)/`

The internal dashboard currently contains:

- Operations dashboard
- Workflows and workflow builder
- Workflow templates
- Human approvals
- Agent activity
- Analytics
- Assistant conversations
- Documents and RAG
- CRM customers
- Notifications
- Settings and schedules

The existing frontend API client is:

- `flowai-frontend/src/api/client.js`

Existing API modules include authentication, workflows, agents, approvals, conversations, documents, customers, schedules, analytics, and notifications.

The internal dashboard must remain available after the expansion.

---

## 4. Target System

```text
Customer Website
      |
      | REST APIs and streaming
      v
FastAPI Backend
      |
      +-- Authentication and authorization
      +-- Commerce services
      +-- CRM services
      +-- AI assistant and RAG
      +-- Workflow engine
      +-- Agent orchestration
      +-- Tool registry
      +-- Approval service
      +-- Notification service
      +-- Analytics and audit logging
      |
      +-- PostgreSQL
      +-- Redis and Celery workers
      +-- ChromaDB
      +-- Object/file storage
      +-- Payment provider
      +-- Email provider
      +-- Shipping provider (later)
      |
      v
Internal FLOWAI Phone/Web Dashboard
```

The backend is the shared business authority. Frontends must not directly modify business state without going through the API.

---

## 5. User Types and Permissions

### 5.1 Customer

A customer can:

- Register and log in.
- Manage their profile and addresses.
- Browse published products.
- Search and filter products.
- Add products to their own cart.
- Place orders.
- View only their own orders.
- View order status and payment status.
- Ask product and support questions.
- Create and view their own support conversations.
- Request cancellation or return.

A customer must never access:

- Another customer's profile.
- Another customer's orders.
- Internal workflows.
- Agent configuration.
- Staff analytics.
- Internal documents unless explicitly published for customers.
- Administrative tools.

### 5.2 Employee

An employee can access assigned operational data according to permission:

- View and manage customers.
- View and process orders.
- View support conversations.
- Run permitted workflows.
- Use permitted tools.
- View operational notifications.

### 5.3 Manager

A manager can additionally:

- Approve or reject sensitive actions.
- Manage workflows.
- View reports and analytics.
- Manage products and inventory if granted.
- Review audit events.

### 5.4 Administrator

An administrator can:

- Manage users and roles.
- Manage the complete catalog.
- Manage inventory.
- Configure integrations.
- Configure agents and allowed tools.
- Manage workflows and schedules.
- View audit logs and system health.

### 5.5 AI agent

An AI agent is not a human user. It must operate through an explicit execution context containing:

- Acting user or system identity.
- Agent identity.
- Allowed tools.
- Resource ownership scope.
- Maximum steps.
- Maximum cost.
- Maximum runtime.
- Approval requirements.
- Audit context.

---

## 6. Identity Model

Keep these concepts separate:

- `User`: login and authentication account.
- `Customer`: CRM profile associated with a customer account or business contact.
- `Product`: item sold by the company.
- `Order`: commercial purchase.
- `Agent`: configured AI worker.

A registered customer should have a `User` account and a linked `Customer` profile. Existing employee CRM contacts may exist without customer login accounts.

Recommended additions to the user model:

- `account_type`: `customer` or `staff`
- `role_name`: `customer`, `employee`, `manager`, or `admin`
- `is_active`
- `email_verified_at` if verification is introduced

Use ownership checks on every customer-specific resource.

---

## 7. Commerce Data Model

Add SQLAlchemy models and Pydantic schemas for the following entities.

### 7.1 Product

Fields:

- `id`
- `sku`, unique
- `name`
- `slug`, unique
- `description`
- `short_description`
- `brand`
- `category_id`
- `price_amount`
- `currency`
- `tax_code` or tax metadata
- `is_published`
- `is_active`
- `image_url` or media references
- `specifications` as structured JSON
- `created_at`
- `updated_at`

Never use floating point for money. Use integer minor units such as cents or a database numeric type.

### 7.2 ProductCategory

Fields:

- `id`
- `name`
- `slug`
- `description`
- `is_active`
- timestamps

### 7.3 Inventory

Fields:

- `id`
- `product_id`, unique or location-scoped
- `quantity_on_hand`
- `quantity_reserved`
- `reorder_level`
- `updated_at`

Available quantity is `quantity_on_hand - quantity_reserved`.

Inventory changes must occur inside transactions and be recorded in an inventory history table if practical.

### 7.4 Address

Fields:

- `id`
- `user_id`
- `label`
- `recipient_name`
- `line1`
- `line2`
- `city`
- `region`
- `postal_code`
- `country_code`
- timestamps

### 7.5 Cart and CartItem

Cart fields:

- `id`
- `user_id` or guest/session identifier for future guest carts
- `status`: `active`, `converted`, `abandoned`
- timestamps

Cart item fields:

- `id`
- `cart_id`
- `product_id`
- `quantity`
- price snapshot if needed
- timestamps

Validate product availability and quantity on every cart mutation and again at checkout.

### 7.6 Order and OrderItem

Order fields:

- `id`
- `order_number`, human-readable and unique
- `user_id`
- `customer_id`
- `status`: `pending`, `confirmed`, `processing`, `fulfilled`, `shipped`, `delivered`, `cancelled`, `returned`, `refunded`
- `payment_status`: `unpaid`, `pending`, `paid`, `failed`, `refunded`
- `fulfillment_status`
- subtotal minor units
- tax minor units
- shipping minor units
- total minor units
- currency
- shipping address snapshot
- billing address snapshot
- customer notes
- timestamps

OrderItem fields:

- `id`
- `order_id`
- `product_id`
- SKU snapshot
- product name snapshot
- unit price snapshot
- quantity
- line total

Orders must preserve snapshots so later product edits do not change historical orders.

### 7.7 Payment

Fields:

- `id`
- `order_id`
- provider name
- provider payment ID
- amount
- currency
- status
- idempotency key
- provider metadata
- timestamps

Never store raw card numbers, CVV, or payment secrets.

### 7.8 SupportTicket

Fields:

- `id`
- `user_id`
- `customer_id`
- `order_id` nullable
- subject
- description
- priority
- status
- assigned staff user nullable
- resolution
- timestamps

### 7.9 ProductReview, optional after MVP

Fields:

- `id`
- `product_id`
- `user_id`
- `order_id` nullable
- rating
- title
- body
- status
- timestamps

Only verified purchasers should review products if this feature is enabled.

---

## 8. API Design

Use `/api/v1` consistently. Use Pydantic request and response schemas. Return predictable errors. Add pagination to list endpoints.

### 8.1 Authentication

Existing endpoints remain:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

Update registration so the account type and role are assigned safely. Public registration must never allow a user to self-select `admin` or `manager`.

Add as needed:

```text
POST /api/v1/auth/logout
POST /api/v1/auth/verify-email
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

Refresh tokens should eventually be persisted, rotated, and revocable.

### 8.2 Public/customer product APIs

```text
GET  /api/v1/store/products
GET  /api/v1/store/products/{product_id}
GET  /api/v1/store/categories
GET  /api/v1/store/categories/{category_id}/products
```

Product list query parameters:

- `search`
- `category_id`
- `min_price`
- `max_price`
- `brand`
- `is_available`
- `page`
- `page_size`
- `sort`

Only active and published products are returned to customers.

### 8.3 Customer profile and addresses

```text
GET    /api/v1/customer/profile
PUT    /api/v1/customer/profile
GET    /api/v1/customer/addresses
POST   /api/v1/customer/addresses
GET    /api/v1/customer/addresses/{address_id}
PUT    /api/v1/customer/addresses/{address_id}
DELETE /api/v1/customer/addresses/{address_id}
```

Every address endpoint must verify ownership.

### 8.4 Cart APIs

```text
GET    /api/v1/store/cart
POST   /api/v1/store/cart/items
PUT    /api/v1/store/cart/items/{item_id}
DELETE /api/v1/store/cart/items/{item_id}
DELETE /api/v1/store/cart
```

Example add item request:

```json
{
  "product_id": 12,
  "quantity": 2
}
```

The server calculates product prices and totals. The client must not be trusted to submit totals.

### 8.5 Checkout and orders

```text
POST /api/v1/store/checkout/quote
POST /api/v1/store/checkout
GET  /api/v1/store/orders
GET  /api/v1/store/orders/{order_id}
POST /api/v1/store/orders/{order_id}/cancel
POST /api/v1/store/orders/{order_id}/return-request
```

Checkout must:

1. Lock or re-check inventory.
2. Recalculate all prices server-side.
3. Validate the shipping address.
4. Create an order atomically.
5. Use an idempotency key.
6. Create or link a payment.
7. Emit an order-created event only once.
8. Start the order workflow.
9. Return safe order information.

Do not mark an order paid merely because the frontend says payment succeeded. Use a payment provider result or explicitly label local development checkout as test mode.

### 8.6 Payment APIs

For the first version, use a test payment mode or cash-on-delivery mode.

```text
POST /api/v1/store/payments/create-intent
POST /api/v1/store/payments/webhook
GET  /api/v1/store/orders/{order_id}/payment
```

A provider such as Stripe can be integrated in test mode first. Webhook signatures must be verified.

### 8.7 Customer AI and support APIs

```text
GET  /api/v1/customer/conversations
POST /api/v1/customer/conversations
GET  /api/v1/customer/conversations/{conversation_id}
POST /api/v1/customer/conversations/{conversation_id}/messages
POST /api/v1/customer/support/tickets
GET  /api/v1/customer/support/tickets
GET  /api/v1/customer/support/tickets/{ticket_id}
```

Customer AI context may include:

- Published product catalog.
- Public product documents.
- Shipping policy.
- Return and refund policy.
- The logged-in customer's own orders.
- The logged-in customer's own support history.

It must never include another customer's data or internal-only documents.

### 8.8 Staff/admin product APIs

```text
GET    /api/v1/admin/products
POST   /api/v1/admin/products
GET    /api/v1/admin/products/{product_id}
PUT    /api/v1/admin/products/{product_id}
DELETE /api/v1/admin/products/{product_id}
POST   /api/v1/admin/products/{product_id}/publish
POST   /api/v1/admin/products/{product_id}/unpublish

GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
PUT    /api/v1/admin/categories/{category_id}
DELETE /api/v1/admin/categories/{category_id}
```

Only authorized staff may use these endpoints.

### 8.9 Staff/admin inventory APIs

```text
GET  /api/v1/admin/inventory
GET  /api/v1/admin/inventory/{product_id}
POST /api/v1/admin/inventory/{product_id}/adjust
GET  /api/v1/admin/inventory/low-stock
```

Inventory adjustments require a reason and must create an audit entry.

### 8.10 Staff/admin order APIs

```text
GET  /api/v1/admin/orders
GET  /api/v1/admin/orders/{order_id}
PUT  /api/v1/admin/orders/{order_id}/status
POST /api/v1/admin/orders/{order_id}/refund
POST /api/v1/admin/orders/{order_id}/fulfill
```

Staff list filters:

- status
- payment status
- date range
- customer
- order number
- page and page size

### 8.11 Existing FLOWAI APIs

Keep and improve:

```text
/api/v1/workflows
/api/v1/workflow-templates
/api/v1/agents
/api/v1/approvals
/api/v1/conversations
/api/v1/documents
/api/v1/customers
/api/v1/schedules
/api/v1/analytics
/api/v1/notifications
/api/v1/jobs
/api/v1/webhooks
/api/v1/system
```

Commerce actions should call services and tools through stable interfaces rather than duplicating business logic inside route functions.

---

## 9. Frontend Applications

### 9.1 Customer website

Preferred long-term structure:

```text
flowai-store-web/
  src/
    api/
    auth/
    components/
    pages/
    routes/
    store/
    styles/
```

A separate React or Next.js web application is recommended for the customer store because it gives better web SEO, product URLs, checkout UX, and responsive browser behavior. It must use the same FastAPI backend.

If the project intentionally keeps one Expo project, create a separate `(customer)` route group and ensure customer routes cannot expose dashboard routes. Do not make the customer experience a modified copy of the staff drawer.

Customer pages:

```text
Home
Product catalog
Product detail
Search results
Cart
Checkout
Order confirmation
My orders
Order detail/tracking
Support
Profile
Addresses
Customer AI assistant
Login
Register
```

Customer UI requirements:

- Responsive desktop and mobile layout.
- Real loading, empty, error, and success states.
- Product images and specifications.
- Accessible forms.
- Server-driven prices and availability.
- No internal dashboard navigation.
- No fake order success.

### 9.2 Existing internal phone app

Preserve the current Expo app and dashboard routes. Expand it with:

```text
(dashboard)/products
(dashboard)/inventory
(dashboard)/orders
(dashboard)/support
(dashboard)/customers
(dashboard)/agents
(dashboard)/workflows
(dashboard)/approvals
(dashboard)/analytics
```

Internal staff must be able to:

- Create and edit products.
- Publish and unpublish products.
- Adjust inventory.
- View and update orders.
- See customer profiles.
- Process support tickets.
- Create and start agents.
- View workflow runs.
- Approve sensitive actions.
- View real analytics.

### 9.3 Frontend state and API rules

Use the existing API client pattern or replace it consistently with a typed/validated client. Do not mix incompatible request conventions.

The frontend must:

- Store tokens securely.
- Handle token expiration and refresh.
- Show API errors.
- Invalidate relevant cached data after mutations.
- Poll or subscribe for long-running workflow and agent runs.
- Never calculate authoritative order totals.
- Never rely on fallback business metrics.

---

## 10. Customer Commerce Flows

### 10.1 Registration

```text
Customer opens store
      ↓
Registers
      ↓
Backend creates User(account_type=customer)
      ↓
Backend creates linked Customer profile
      ↓
Customer receives tokens
      ↓
Customer enters store
```

### 10.2 Product browsing

```text
Customer requests published products
      ↓
Backend filters catalog
      ↓
Backend returns products and availability
      ↓
Customer opens product detail
      ↓
Customer asks AI questions or adds item to cart
```

### 10.3 Checkout

```text
Customer reviews cart
      ↓
Backend calculates quote
      ↓
Customer confirms address and payment method
      ↓
Backend validates stock and price
      ↓
Backend creates order idempotently
      ↓
Payment is recorded or test payment completes
      ↓
Order-created event is emitted
      ↓
Order workflow starts
      ↓
Customer sees confirmation
```

### 10.4 Order processing

```text
Order created
      ↓
Validate payment
      ↓
Check inventory
      ↓
Is stock available?
  No  -> mark attention required, notify staff and customer
  Yes -> reserve stock
      ↓
Create fulfillment task
      ↓
Notify staff
      ↓
Send customer confirmation
      ↓
Update order status
      ↓
Record analytics and audit events
```

### 10.5 Customer support

```text
Customer reports problem
      ↓
Conversation or ticket is created
      ↓
AI identifies customer and order
      ↓
AI classifies issue and priority
      ↓
RAG retrieves relevant policy
      ↓
AI drafts response and recommended action
      ↓
Sensitive refund/replacement action requires approval
      ↓
Approved action executes
      ↓
Customer receives notification
```

---

## 11. AI Capabilities

### 11.1 Product assistant

The product assistant should:

1. Understand the customer question.
2. Search products using structured filters.
3. Retrieve relevant product documents.
4. Respect budget, category, compatibility, and availability constraints.
5. Recommend products with reasons.
6. Link to product IDs or product pages.
7. Clearly distinguish facts from recommendations.
8. Say when information is unavailable.

Do not let the LLM invent price, stock, warranty, or product specifications. Product facts must come from the database or approved documents.

### 11.2 Order assistant

The order assistant may answer only for the authenticated customer:

- Order status.
- Items in an order.
- Payment status.
- Shipping address summary.
- Available cancellation or return options.

Sensitive actions must call backend services and must be permission-checked.

### 11.3 AI agents

Create specialized agents:

- Product Recommendation Agent
- Customer Support Agent
- Order Processing Agent
- Inventory Monitoring Agent
- Sales Reporting Agent
- Complaint Resolution Agent

The supervisor may delegate work:

```text
Supervisor
  +-- Product Agent
  +-- Customer Support Agent
  +-- Order Agent
  +-- Inventory Agent
  +-- Reporting Agent
```

Agents must have explicit allowed tools and execution limits. A customer-facing assistant should not have access to administrative tools.

### 11.4 Agent management UI

The internal Agents screen must be expanded to include:

- List configured agents.
- Create an agent.
- Edit agent name and description.
- Select allowed tools.
- Start a run with an objective.
- Select an agent.
- View queued, running, succeeded, and failed runs.
- View step timeline, tool calls, observations, errors, and cost.
- Retry a failed run where safe.

The existing backend endpoints are the starting point:

```text
GET  /api/v1/agents
POST /api/v1/agents
GET  /api/v1/agents/runs
POST /api/v1/agents/runs
GET  /api/v1/agents/runs/{run_id}
GET  /api/v1/agents/tools
```

Fix the backend fallback path and import issues before relying on synchronous execution.

---

## 12. Commerce Workflows

Create real workflow templates backed by the workflow engine.

### 12.1 Order processing workflow

```text
Order Created Trigger
      ↓
Validate Payment
      ↓
Check Inventory
      ↓
Condition: Stock Available
  +---+---+
  |       |
 Yes      No
  |       |
Reserve   Notify Customer and Staff
Stock     |
  |       +--> Await Manual Resolution
Create Fulfillment Task
      ↓
Send Customer Confirmation
      ↓
Update Analytics
```

### 12.2 Support workflow

```text
Support Request Trigger
      ↓
Find Customer and Order
      ↓
Classify Issue and Priority
      ↓
Retrieve Return/Refund Policy
      ↓
Draft Response
      ↓
Condition: Sensitive Action?
  +---+---+
  |       |
 No      Yes
  |       |
Send     Approval Request
Response       ↓
         Approve or Reject
                ↓
         Execute Approved Action
                ↓
         Notify Customer
```

### 12.3 Low-stock workflow

```text
Low Stock Trigger
      ↓
Identify Product
      ↓
Calculate Risk
      ↓
Notify Inventory Manager
      ↓
Create Reorder Task
```

### 12.4 Daily sales report

```text
Schedule Trigger
      ↓
Query Orders
      ↓
Calculate Revenue and Product Metrics
      ↓
AI Generates Summary
      ↓
Create Report
      ↓
Notify Management
```

### 12.5 Workflow correctness

Use one canonical condition schema everywhere. Recommended format:

```json
{
  "field": "inventory_available",
  "operator": "equals",
  "value": true,
  "true_target": "reserve_stock",
  "false_target": "notify_out_of_stock"
}
```

Update the frontend builder, backend schema, graph validation, and executor to use the same format. Add tests for both branches.

---

## 13. Events, Queues, and Idempotency

Commerce events include:

- `customer_registered`
- `order_created`
- `payment_succeeded`
- `payment_failed`
- `inventory_reserved`
- `inventory_low`
- `order_shipped`
- `support_ticket_created`
- `approval_requested`

Every external event must have:

- Event ID.
- Event type.
- Source.
- Payload.
- Received timestamp.
- Processing status.
- Error and retry information.

Use idempotency keys for:

- Checkout.
- Payment creation.
- Payment webhooks.
- Inventory reservation.
- Order workflow start.
- Email sending.
- Webhook event processing.

A retry must never send duplicate email, charge a customer twice, create duplicate orders, or reserve stock twice.

Use Celery for work that may be slow or retryable:

- Document indexing.
- Workflow execution.
- Agent execution.
- Email delivery.
- Report generation.
- Notifications.
- Inventory alerts.

The API should return a job or run identifier when work is asynchronous.

---

## 14. Payments and External Integrations

Start with development-safe payment modes:

1. Test checkout without real money.
2. Cash on delivery or manual payment.
3. Stripe test mode.
4. Production payment provider only after webhook, refund, and idempotency tests pass.

Email integration progression:

1. Database notification and development mail logger.
2. Configured SMTP or provider sandbox.
3. Production provider with templates, retries, and delivery status.

Calendar integration is not required for the commerce MVP. Keep it isolated and do not block store development on it.

External credentials must come from environment variables or a secret manager. Never commit secrets or use hardcoded webhook secrets.

---

## 15. Analytics and Real Values

Remove hardcoded business baselines from authoritative analytics.

Calculate from persisted records:

- Published product count.
- Active customer count.
- Orders created.
- Orders completed.
- Orders cancelled.
- Revenue.
- Average order value.
- Low-stock products.
- Support tickets.
- Workflow runs.
- Workflow success and failure rate.
- Approval count.
- Agent runs.
- Tool calls.
- LLM token usage.
- AI cost.
- Human intervention rate.
- Estimated time saved.

If there is insufficient data, return zero or a clear `no_data` state. Do not show invented numbers such as fake hours saved or AI costs.

Dashboard cards must distinguish:

- Real measured values.
- Estimates with methodology.
- Unavailable metrics.

---

## 16. Security Requirements

Required before production:

- Password hashing.
- Secure token storage.
- Access token expiration.
- Refresh token rotation and revocation.
- Role-based authorization.
- Object ownership checks.
- Customer order isolation.
- Agent tool allowlists.
- Approval checks for refunds, cancellations, external messages, and sensitive updates.
- Input validation.
- File type and size validation.
- Rate limiting.
- Webhook signature verification.
- Secret management.
- Audit logging.
- Prompt injection defenses.
- Output and tool argument validation.
- No raw payment data storage.
- Safe error messages without secrets.

AI-specific rules:

- Never trust customer text as an instruction to bypass permissions.
- Never let retrieved documents redefine system permissions.
- Never allow the LLM to choose an unauthorized tool.
- Never expose internal documents to customers.
- Require confirmation or approval before external side effects.

---

## 17. Testing Requirements

### Backend unit tests

Test:

- Product validation.
- Money calculations.
- Cart quantity rules.
- Inventory availability.
- Inventory reservation and release.
- Order totals.
- Customer ownership.
- Role checks.
- Idempotency.
- Payment state transitions.
- Workflow conditions.
- Approval behavior.
- Agent tool permissions.

### API tests

Test:

- Customer registration.
- Staff login.
- Product visibility.
- Customer cannot read another customer's order.
- Customer cannot use staff endpoints.
- Cart creation and updates.
- Checkout.
- Duplicate checkout requests.
- Order listing and detail.
- Payment webhook verification.
- Staff order updates.
- Product publishing.

### Workflow tests

Test:

- Order-created workflow.
- In-stock branch.
- Out-of-stock branch.
- Approval pause.
- Approval rejection.
- Approval resume.
- Retry behavior.
- Duplicate event behavior.
- Failed tool behavior.

### Frontend tests

Test or manually verify:

- Customer registration and login.
- Product listing and search.
- Product detail.
- Cart persistence.
- Checkout validation.
- Order confirmation.
- Order history.
- Staff product management.
- Staff inventory management.
- Staff order processing.
- Agent creation and run start.
- Real empty, loading, error, and success states.

### AI evaluation

Create a small golden dataset for:

- Product recommendation accuracy.
- Product fact grounding.
- Order question ownership.
- Refund policy retrieval.
- Correct tool selection.
- Correct workflow branching.
- Prompt injection resistance.

---

## 18. Implementation Phases

### Phase 0: Baseline and cleanup

- Run the existing backend tests.
- Run the frontend and backend locally.
- Record current failures.
- Fix import/runtime blockers.
- Replace hardcoded secrets with configuration.
- Document local startup commands.
- Establish database migration workflow.

Acceptance: existing FLOWAI dashboard, authentication, conversations, documents, workflows, and approvals still work.

### Phase 1: Commerce foundation

- Add ProductCategory, Product, and Inventory models.
- Add migrations.
- Add schemas and service layer.
- Add admin product/category/inventory APIs.
- Add staff product and inventory screens.
- Seed a small development catalog.

Acceptance: staff can create, edit, publish, unpublish, and stock products; public API returns only published products.

### Phase 2: Customer identity

- Add customer account type.
- Link User to Customer.
- Add profile and address APIs.
- Separate customer and staff route access.
- Add customer website authentication.

Acceptance: customer and staff accounts see different navigation and data.

### Phase 3: Customer catalog

- Build product listing.
- Build search/filter.
- Build product details.
- Add availability and specification display.

Acceptance: customers can browse real database products on desktop and mobile.

### Phase 4: Cart and test checkout

- Add Cart and CartItem.
- Add Order and OrderItem.
- Add server-side quote.
- Add test checkout.
- Add order history and detail.
- Add idempotency.

Acceptance: a customer can create a cart and complete one test order, and staff can see it.

### Phase 5: Inventory and order workflow

- Implement transactional inventory reservation.
- Implement order-created event.
- Implement order processing workflow.
- Add staff order management.
- Add customer and staff notifications.

Acceptance: an order changes real order, inventory, workflow, notification, and audit records.

### Phase 6: AI product and order assistant

- Connect product catalog retrieval to AI.
- Add product documents to RAG.
- Add customer-owned order context.
- Enforce ownership and tool permissions.
- Add customer support conversations.

Acceptance: AI answers grounded product questions and only discusses the logged-in customer's orders.

### Phase 7: Payments

- Add payment abstraction.
- Add test provider.
- Add provider webhooks.
- Add idempotent payment handling.
- Add refund workflow with approval.

Acceptance: test payment success/failure/refund paths are reliable and audited.

### Phase 8: Full agents and operations

- Add agent management UI.
- Add agent run UI.
- Add commerce agents.
- Add supervisor delegation.
- Add cost and tool-call reporting.

Acceptance: staff can create an agent, select tools, start a run, and inspect its execution trace.

### Phase 9: Real integrations and production hardening

- Configure real email provider.
- Add shipping integration if required.
- Add object storage.
- Enforce PostgreSQL migrations.
- Harden WebSockets.
- Add monitoring, tracing, backups, CI/CD, and deployment.

Acceptance: production deployment has no demo metrics, hardcoded credentials, unsafe ownership paths, or untracked external side effects.

---

## 19. Required First Vertical Slice

The first complete slice must be:

```text
Staff logs in
      ↓
Staff creates a product and inventory quantity
      ↓
Customer registers on the store website
      ↓
Customer sees the published product
      ↓
Customer asks the product assistant a grounded question
      ↓
Customer adds the product to cart
      ↓
Customer completes test checkout
      ↓
Backend creates one order
      ↓
Inventory is reserved
      ↓
Order workflow runs
      ↓
Customer receives confirmation
      ↓
Staff sees the order in the phone dashboard
      ↓
Analytics show the real order and workflow data
```

Do not move to broad feature work until this slice works end-to-end with tests.

---

## 20. Definition of Done

The expanded project is complete when:

- A customer can register and log in through the website.
- A staff member can manage a real product catalog.
- Customers can browse real products from the database.
- Customers can use an AI assistant grounded in product data.
- Customers can create carts and place test or real orders.
- Orders have persistent statuses, payment states, and item snapshots.
- Inventory is updated transactionally.
- Duplicate requests do not duplicate orders, payments, emails, or reservations.
- Order workflows execute and persist every step.
- Sensitive actions pause for human approval.
- Staff can manage customers, products, inventory, orders, agents, workflows, approvals, and reports from the existing FLOWAI application.
- Customers can see only their own protected data.
- Agents have visible configuration, allowed tools, runs, plans, and execution traces.
- Analytics are calculated from real records and do not use invented fallback values.
- Notifications and audit logs record important actions.
- Background jobs, retries, and failures are observable.
- The project has automated tests for commerce, security, workflows, agents, and integrations.
- The customer website and internal phone app use the same backend without exposing each other's private routes.

The final result should feel like a real online business operated by FLOWAI: the website serves customers, and the existing dashboard gives staff and AI agents the tools to operate the business safely.

---

## 21. Instructions to the Implementation AI

Before each phase:

1. Inspect the relevant existing files and tests.
2. State the smallest implementation slice.
3. Implement backend models, schemas, services, and APIs together.
4. Implement the matching frontend screen and API client.
5. Add tests before moving to the next phase.
6. Run focused tests and report failures honestly.
7. Do not replace real values with fallback demo values.
8. Do not rewrite unrelated existing code.
9. Do not introduce a second authentication system.
10. Do not bypass the workflow engine for commerce actions that should be observable.
11. Do not allow an LLM to directly write arbitrary database changes.
12. Use deterministic backend services for money, inventory, permissions, and order state.
13. Use AI for interpretation, recommendations, classification, summarization, and planning inside controlled boundaries.
14. Keep external integrations behind provider interfaces so development providers can be replaced safely.
15. Update this document or the repository README when architecture decisions change.

Every completed phase must include:

- Files changed.
- API endpoints added or modified.
- Database changes.
- Frontend routes added or modified.
- Tests added.
- Commands run.
- Known limitations.

Never report a mocked or placeholder implementation as production-ready.

---

## 22. Customer Website Production Stack and Coding Standards

The customer-facing commerce website should be a separate production web application. Keep the existing Expo React Native application for the internal FLOWAI staff operations app.

### 22.1 Recommended technologies

Use:

- Next.js with the App Router.
- React.
- TypeScript with strict type checking.
- Tailwind CSS for styling.
- An accessible component system such as shadcn/ui where useful.
- TanStack Query for server state and API data.
- Zustand only for small client-side state such as cart UI state or temporary preferences.
- React Hook Form and Zod for forms and validation.
- Playwright for browser end-to-end testing.
- Vitest for focused unit tests.

Do not build the customer store as a collection of manually linked static HTML pages. React and Next.js still produce HTML, CSS, and browser JavaScript, but they provide routing, reusable components, server rendering, data loading, validation, and production conventions.

Use TypeScript rather than plain JavaScript for the new website. The shared backend contract contains customers, products, carts, orders, payments, workflows, and AI actions; static typing will reduce mistakes at these boundaries.

### 22.2 Why Next.js is appropriate

The website needs:

- Search-engine-friendly product pages.
- Fast initial page loading.
- Server-side rendering or static rendering for public catalog pages.
- Product metadata and shareable product URLs.
- Responsive desktop and mobile layouts.
- Secure authenticated customer pages.
- Strong checkout and form handling.
- Image optimization.
- Clear separation between public pages and authenticated pages.

Product pages should have stable URLs and useful metadata. Public product content may be rendered or cached on the server, while customer-specific pages such as orders and checkout must be authenticated and personalized.

### 22.3 Application separation

Maintain these three responsibilities:

```text
Customer website: Next.js, TypeScript, React
Internal staff app: Existing Expo React Native application
Business backend: Existing FastAPI application
```

Both frontends communicate with the same FastAPI backend. Neither frontend may directly access PostgreSQL, Redis, ChromaDB, or payment-provider secrets.

The customer website must not expose internal dashboard navigation. The staff app must remain capable of managing products, inventory, orders, customers, workflows, agents, approvals, notifications, and analytics.

### 22.4 Website coding standards

Use strict TypeScript and meaningful types for every API request and response. Keep UI components, API clients, validation schemas, and business rules separate.

Follow these rules:

- Keep components focused on one responsibility.
- Put API calls in a dedicated API layer, not scattered through visual components.
- Use reusable components for buttons, inputs, product cards, prices, status badges, tables, dialogs, and error states.
- Use server data libraries for server data instead of copying API state into many unrelated React states.
- Validate forms on the client for usability and again on the backend for security.
- Handle loading, empty, error, and success states on every data-driven screen.
- Use accessible labels, keyboard navigation, focus states, semantic elements, and appropriate error messages.
- Use responsive layouts for phone, tablet, and desktop widths.
- Use environment variables for public API configuration.
- Never place API keys, database credentials, payment secrets, or JWT secrets in client code.
- Never trust frontend prices, totals, stock values, roles, or permissions.
- Avoid empty error handlers and silent failed requests.
- Do not use fake fallback orders, customers, products, revenue, or analytics in production screens.
- Use stable keys and stable product identifiers.
- Keep formatting for money, dates, quantities, and statuses centralized and consistent.
- Add tests for checkout, authentication, order visibility, and important mutations.

### 22.5 API client and data management

Create typed API modules for authentication, products, categories, cart, checkout, orders, support, and customer conversations. Use TanStack Query for fetching, caching, loading states, retries, and invalidation.

The backend remains authoritative for:

- Product price.
- Product availability.
- Tax.
- Shipping cost.
- Discount eligibility.
- Cart totals.
- Payment status.
- Order status.
- Customer ownership.

After a mutation, invalidate or refetch the affected server data. For example, adding a cart item must refresh the cart and any cart-count indicator. Completing checkout must refresh the cart, order history, and relevant customer notifications.

Use optimistic updates only where rollback is reliable. Do not optimistically mark payments successful, inventory available, orders fulfilled, or refunds complete.

### 22.6 Web authentication

For the website, prefer secure `httpOnly`, `Secure`, and appropriately scoped cookies over storing access tokens in `localStorage`. Implement access-token expiration, refresh-token rotation, logout, and revocation in the backend.

The backend must enforce the identity and role on every protected request. Frontend route guards are for user experience only and are not security controls.

Customer-specific endpoints must verify ownership on the server. A customer may read only their own profile, addresses, cart, orders, payments, conversations, and support tickets.

### 22.7 Customer website experience

The website should include:

- Public home page.
- Product catalog.
- Search and filters.
- Product details with images, price, stock, specifications, warranty, and delivery information.
- Cart.
- Checkout.
- Order confirmation.
- Customer order history.
- Order details and status.
- Profile and addresses.
- Support tickets and conversations.
- AI product assistant.
- Login, registration, logout, and account recovery.

The interface should feel like a trustworthy business equipment store, not an internal AI dashboard. Product images, specifications, prices, availability, comparison tools, and clear purchase actions are more important than decorative AI visuals.

Use a restrained professional visual system with clear contrast, a small set of purposeful colors, consistent spacing, readable typography, and responsive product grids. Include real product media or development assets that clearly represent the product. Do not use placeholder marketing claims as if they were real product information.

### 22.8 AI website integration

The AI assistant should support the store without becoming the source of truth. It may interpret questions, recommend products, summarize policies, classify support issues, and guide customers through available actions.

For product questions, the AI must retrieve product facts from the catalog and approved documents. It must not invent price, stock, compatibility, warranty, delivery, or refund information.

For order questions, the AI may retrieve only the authenticated customer's orders. Any cancellation, return, refund, address change, or other side effect must call a controlled backend operation and follow permission, validation, idempotency, and approval rules.

### 22.9 Website testing

Use automated browser tests for these journeys:

- Customer registration and login.
- Public product browsing and search.
- Product detail display.
- Add to cart and update quantity.
- Checkout validation.
- Successful test checkout.
- Failed payment or unavailable inventory.
- Customer order history.
- Customer cannot view another customer's order.
- Customer support request.
- Product assistant response using approved catalog data.

Test the website against a running API or a controlled test API contract. Do not rely only on visual snapshots; verify visible behavior, network results, permissions, and resulting database state.

### 22.10 Production deployment

The recommended deployment arrangement is:

```text
Next.js website -> managed web hosting such as Vercel
Expo staff app -> Expo Application Services
FastAPI backend -> managed application hosting
PostgreSQL -> managed PostgreSQL
Redis -> managed Redis
Files and product media -> S3-compatible object storage
Payments -> Stripe or another provider in test mode first
Email -> configured transactional email provider
```

The exact hosting vendor may change, but the boundaries must remain the same. Configure separate development, test, and production environments. Use HTTPS in production, secure CORS allowlists, structured logging, health checks, database backups, error monitoring, and deployment rollback procedures.

The website must be usable locally without production credentials by using a documented test payment mode, development email provider, seed catalog, and local backend configuration.
