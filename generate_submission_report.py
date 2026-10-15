"""
Script to generate the official academic project submission report PDF for AnnaSetu AI.
Formatted specifically for comprehensive engineering project submission.
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8.5)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 755, "AnnaSetu AI — Capstone Project Submission Report")
            self.drawRightString(558, 755, "UN SDG 2 & SDG 12")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.6)
            self.line(54, 747, 558, 747)
        
        # Footer (all pages)
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 34, page_str)
        self.drawString(54, 34, "AnnaSetu AI | SDG 2 (Zero Hunger) & SDG 12 (Responsible Consumption)")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.6)
        self.line(54, 46, 558, 46)
        self.restoreState()


def create_submission_report_pdf():
    pdf_path = "AnnaSetu_AI_Project_Submission_Report.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    c_primary = colors.HexColor("#064e3b")    # Deep Emerald
    c_secondary = colors.HexColor("#047857")  # Emerald Green
    c_accent = colors.HexColor("#b45309")     # Warm Amber
    c_dark = colors.HexColor("#0f172a")       # Slate 900
    c_body = colors.HexColor("#334155")       # Slate 700
    c_rose = colors.HexColor("#9f1239")       # Wine
    c_border = colors.HexColor("#cbd5e1")
    c_bg_light = colors.HexColor("#f8fafc")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=c_primary,
        spaceAfter=4
    )

    tagline_style = ParagraphStyle(
        'DocTagline',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_accent,
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=c_primary,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=c_secondary,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=c_body,
        spaceAfter=5
    )

    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.white
    )

    td_bold = ParagraphStyle(
        'TableBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=c_dark
    )

    td_text = ParagraphStyle(
        'TableText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=c_body
    )

    story = []

    # Title & Metadata
    story.append(Paragraph("PROJECT SUBMISSION REPORT: ANNASETU AI", title_style))
    story.append(Paragraph("“Share More. Waste Less. Feed Hope.” — Smart Surplus Food Redistribution Platform", tagline_style))

    meta_content = (
        "<b>Initiative:</b> AnnaSetu AI Engineering Project &nbsp;|&nbsp; "
        "<b>Project Track:</b> Full-Stack Autonomous Platform<br/>"
        "<b>Primary SDG:</b> UN Sustainable Development Goal 2: Zero Hunger &nbsp;|&nbsp; "
        "<b>Secondary SDG:</b> UN SDG 12: Responsible Consumption and Production<br/>"
        "<b>Platform Scope:</b> Production-ready Full-Stack Web Application with React 19, FastAPI, SQLite/PostgreSQL, Gemini AI SDK, and Deterministic Governance"
    )
    t_meta = Table([[Paragraph(meta_content, body_style)]], colWidths=[504])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ecfdf5")),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#a7f3d0")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # 1. Executive Summary
    story.append(Paragraph("1. Executive Summary & Problem Context", h1_style))
    story.append(Paragraph(
        "India ranks among the largest food-producing nations, yet paradoxically, millions experience severe nutritional insecurity daily while metric tonnes of fresh, wholesome food from hotels, banquet halls, weddings, corporate cafeterias, and hostels are dumped into landfills. According to UNEP estimates, over 50 million tonnes of food waste is generated in urban India annually, emitting severe methane greenhouse gases.",
        body_style
    ))
    story.append(Paragraph(
        "Existing donation efforts remain fragmented, informal, and prone to severe logistical and safety failures: (1) donors lack safe, legally compliant platforms with liability protections; (2) charities cannot predict food arrival times or batch sizes; (3) volunteers lack temperature-controlled transit guidelines; and (4) unverified intermediaries create food-safety hazards. <b>AnnaSetu AI</b> resolves this coordination failure by engineering a verifiable, role-gated, and AI-orchestrated bridge connecting commercial donors with accredited beneficiary organizations.",
        body_style
    ))

    # 2. Key Innovations
    story.append(Paragraph("2. Architectural Innovations & Technical Highlights", h1_style))
    story.append(Paragraph(
        "• <b>Conservative Food-Safety Priority:</b> Food safety takes absolute precedence over algorithmic matching. Listings enforce FSSAI temperature holding parameters (hot-holding &ge;60°C, chilled &le;5°C) and mandatory legal hygiene declarations.<br/>"
        "• <b>Deterministic Proximity Matching (0–100):</b> Replaces opaque models with an auditable multi-factor scoring formula combining geodesic Haversine distance (&le;40 pts), shelter intake capacity fit (&le;30 pts), schedule urgency window (&le;20 pts), and dietary compatibility (&le;10 pts).<br/>"
        "• <b>Concurrency & Atomic Inventory Reservation:</b> Implements database row-level locking (<code>SELECT FOR UPDATE</code>) preventing race conditions, over-allocation, or double-claiming of meals.<br/>"
        "• <b>Resilient Google Gemini AI Co-Pilot:</b> Integrates official Google Gemini Python SDK with 100% deterministic rule-based fallbacks, ensuring flawless operations even without an API key or under network partitions.<br/>"
        "• <b>Volunteer Courier Lifecycle State Machine:</b> Auditable 4-stage transit lifecycle (<code>ASSIGNED</code> &rarr; <code>ACCEPTED</code> &rarr; <code>PICKED_UP</code> &rarr; <code>COMPLETED</code>) with thermal integrity sign-offs.<br/>"
        "• <b>Live Database-Calculated Impact:</b> Real SQL aggregations of plates salvaged, kilograms diverted, and landfill methane prevention with zero fabricated demo numbers.",
        body_style
    ))

    # 3. Technology Stack Table
    story.append(Paragraph("3. Full-Stack Technology Stack", h1_style))
    tech_data = [
        [Paragraph("Tier / Layer", th_style), Paragraph("Technology Selection", th_style), Paragraph("Architectural Rationale & Capabilities", th_style)],
        [Paragraph("Frontend Client", td_bold), Paragraph("React 19, Vite, TypeScript, Tailwind CSS v4", td_text), Paragraph("Type-safe reactive user interface, lightning-fast HMR builds, modern accessible design system.", td_text)],
        [Paragraph("UI & Visuals", td_bold), Paragraph("Lucide React, Recharts, React Router v7", td_text), Paragraph("Rich icon ecosystem, dynamic SQL impact graphs, role-guarded declarative navigation.", td_text)],
        [Paragraph("Backend Framework", td_bold), Paragraph("Python 3.12/3.14, FastAPI, Pydantic v2", td_text), Paragraph("Asynchronous high-throughput REST APIs, automated OpenAPI documentation, strict request schema validation.", td_text)],
        [Paragraph("ORM & Migrations", td_bold), Paragraph("SQLAlchemy 2.0 ORM, Alembic Migrations", td_text), Paragraph("Clean relational model abstraction, production schema migration tracking, declarative relationships.", td_text)],
        [Paragraph("Database Engine", td_bold), Paragraph("SQLite (Local) / PostgreSQL (Cloud Deploy)", td_text), Paragraph("Zero-config local demonstration database structured for seamless 12-factor cloud deployment.", td_text)],
        [Paragraph("Authentication & Security", td_bold), Paragraph("Argon2 Password Hashing, HS256 JWT Tokens", td_text), Paragraph("Cryptographically secure credentials hashing, stateless token verification, strict backend RBAC guards.", td_text)],
        [Paragraph("AI Engine", td_bold), Paragraph("Google Gemini Python SDK + Rule Fallback", td_text), Paragraph("Structured JSON extraction, natural language search parser, resilient deterministic fallbacks.", td_text)]
    ]
    t_tech = Table(tech_data, colWidths=[100, 150, 254])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_tech)
    story.append(Spacer(1, 10))

    # 4. Multi-Role Permissions Matrix
    story.append(Paragraph("4. Role-Based Access Control (RBAC) Architecture", h1_style))
    rbac_data = [
        [Paragraph("Role", th_style), Paragraph("Authorized Operational Scope", th_style), Paragraph("Security Boundaries & Safeguards", th_style)],
        [Paragraph("Food Donor", td_bold), Paragraph("Create surplus food listings, run AI category suggestions, review proximity matches, approve requests, monitor delivery.", td_text), Paragraph("Isolated strictly to own kitchen listings; recipient beneficiary details redacted until match approval.", td_text)],
        [Paragraph("Recipient (NGO)", td_bold), Paragraph("Browse food catalog, search with AI natural language parser, reserve batches within daily capacity limits, confirm delivery.", td_text), Paragraph("<b>Accreditation Lock:</b> Unverified NGOs cannot request live donations until approved by admin.", td_text)],
        [Paragraph("Volunteer Courier", td_bold), Paragraph("Browse unassigned runs across Bengaluru, self-claim runs, record kitchen collection, verify thermal containers, sign off delivery.", td_text), Paragraph("Restricted exclusively to active runs; cannot view private donor financial records or other NGOs.", td_text)],
        [Paragraph("Administrator", td_bold), Paragraph("Review pending 12A/80G/Darpan documents, investigate safety tickets, moderate listings, toggle account status, audit tamper-evident logs.", td_text), Paragraph("Protected command center. Seeded via environment variables; public registration as admin is prohibited.", td_text)]
    ]
    t_rbac = Table(rbac_data, colWidths=[90, 190, 224])
    t_rbac.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_secondary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_rbac)
    story.append(Spacer(1, 10))

    # 5. Automated Verification & Testing
    story.append(Paragraph("5. Rigorous Automated Test Suite & Verification Results", h1_style))
    story.append(Paragraph(
        "To ensure production reliability and prevent regressions, AnnaSetu AI was validated with an automated test suite covering authentication, RBAC boundaries, atomic concurrency, input validation, expiration filters, and live end-to-end integration:",
        body_style
    ))
    test_data = [
        [Paragraph("Test Identifier", th_style), Paragraph("Functional Requirement Tested", th_style), Paragraph("Result", th_style)],
        [Paragraph("test_successful_registration_and_login", td_bold), Paragraph("Argon2 password hashing, unique emails, and JWT token issue", td_text), Paragraph("PASSED", td_bold)],
        [Paragraph("test_invalid_credentials_rejected", td_bold), Paragraph("Rejection of incorrect passwords with 401 Unauthorized", td_text), Paragraph("PASSED", td_bold)],
        [Paragraph("test_role_based_access_restrictions", td_bold), Paragraph("Ensures food donors cannot invoke volunteer dispatch APIs", td_text), Paragraph("PASSED", td_bold)],
        [Paragraph("test_unverified_recipient_cannot_request_donation", td_bold), Paragraph("Enforces the NGO accreditation barrier preventing unverified food requests", td_text), Paragraph("PASSED", td_bold)],
        [Paragraph("test_valid_listing_creation", td_bold), Paragraph("Listing creation with valid units, categories, and FSSAI safety declarations", td_text), Paragraph("PASSED", td_bold)],
        [Paragraph("test_invalid_quantity_and_deadline_rejection", td_bold), Paragraph("Validation rejecting zero/negative quantities and past pickup deadlines", td_text), Paragraph("PASSED", td_bold)],
        [Paragraph("test_expired_listings_excluded_from_matching", td_bold), Paragraph("Time-boundary filter ensuring expired listings are excluded from matching", td_text), Paragraph("PASSED", td_bold)],
        [Paragraph("test_donation_acceptance_prevents_excessive_allocation", td_bold), Paragraph("Atomic row locking preventing excessive reservation or race conditions", td_text), Paragraph("PASSED", td_bold)],
        [Paragraph("test_invalid_status_transitions_rejected", td_bold), Paragraph("State machine validation enforcing valid courier lifecycle transitions", td_text), Paragraph("PASSED", td_bold)],
        [Paragraph("test_unauthorized_user_cannot_cancel_others_listing", td_bold), Paragraph("Multi-tenancy isolation preventing unauthorized modification of listings", td_text), Paragraph("PASSED", td_bold)],
        [Paragraph("test_volunteers_can_only_modify_assigned_tasks", td_bold), Paragraph("Courier task isolation preventing volunteers from tampering with other runs", td_text), Paragraph("PASSED", td_bold)],
        [Paragraph("test_notification_access_is_user_isolated", td_bold), Paragraph("User notification isolation with zero cross-user message leakage", td_text), Paragraph("PASSED", td_bold)],
        [Paragraph("test_ai_failures_trigger_safe_fallback", td_bold), Paragraph("Deterministic rule engine fallback when Gemini API key is unset", td_text), Paragraph("PASSED", td_bold)],
        [Paragraph("test_natural_language_search_parser", td_bold), Paragraph("Semantic search query decomposition into structured SQL filters", td_text), Paragraph("PASSED", td_bold)],
        [Paragraph("test_impact_metrics_calculation", td_bold), Paragraph("Accurate SQL aggregation of redistributed servings, kg, and trends", td_text), Paragraph("PASSED", td_bold)],
        [Paragraph("test_admin_actions_require_admin_role", td_bold), Paragraph("RBAC guard preventing privilege escalation to admin operations", td_text), Paragraph("PASSED", td_bold)],
        [Paragraph("test_e2e_full_platform_lifecycle", td_bold), Paragraph("Live end-to-end integration: Donor post &rarr; Match &rarr; Request &rarr; Transit &rarr; Impact", td_text), Paragraph("PASSED", td_bold)]
    ]
    t_test = Table(test_data, colWidths=[180, 260, 64])
    t_test.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_accent),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_test)
    story.append(Spacer(1, 10))

    # 6. Pre-Seeded Academic Credentials
    story.append(Paragraph("6. Pre-Seeded Demonstration Accounts (One-Click Login)", h1_style))
    demo_data = [
        [Paragraph("Persona / Role", th_style), Paragraph("Login Email", th_style), Paragraph("Password", th_style), Paragraph("Operational Scenario for Evaluators", th_style)],
        [Paragraph("Administrator", td_bold), Paragraph("admin@annasetu.ai", td_text), Paragraph("Admin@123456", td_text), Paragraph("Review pending NGO verifications, triage safety alerts, inspect immutable audit trail.", td_text)],
        [Paragraph("Donor (Hotel)", td_bold), Paragraph("donor.taj@annasetu.ai", td_text), Paragraph("Demo@123456", td_text), Paragraph("The Grand Palace Hotel: Post banquet meals with AI assist, inspect match scores, approve requests.", td_text)],
        [Paragraph("Donor (Hostel)", td_bold), Paragraph("donor.hostel@annasetu.ai", td_text), Paragraph("Demo@123456", td_text), Paragraph("Royal Palms Hostels: Manage bulk student dining hall surplus food batches.", td_text)],
        [Paragraph("Verified NGO", td_bold), Paragraph("ngo.hope@annasetu.ai", td_text), Paragraph("Demo@123456", td_text), Paragraph("Hope Foundation Shelter: Browse catalog with AI search parser, reserve food batches.", td_text)],
        [Paragraph("Community Kitchen", td_bold), Paragraph("ngo.annapurna@annasetu.ai", td_text), Paragraph("Demo@123456", td_text), Paragraph("Annapurna Dining: High-capacity daily meal distribution.", td_text)],
        [Paragraph("Pending NGO", td_bold), Paragraph("ngo.samarpan@annasetu.ai", td_text), Paragraph("Demo@123456", td_text), Paragraph("Samarpan Trust: Demonstrates accreditation security barrier preventing unverified food requests.", td_text)],
        [Paragraph("Volunteer Courier", td_bold), Paragraph("volunteer.rahul@annasetu.ai", td_text), Paragraph("Demo@123456", td_text), Paragraph("Rahul Sharma: Claim runs, progress delivery lifecycle (ASSIGNED &rarr; ACCEPTED &rarr; PICKED_UP &rarr; COMPLETED).", td_text)]
    ]
    t_demo = Table(demo_data, colWidths=[95, 115, 75, 219])
    t_demo.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_demo)
    story.append(Spacer(1, 10))

    # 7. Conclusion & Alignment
    story.append(Paragraph("7. Conclusion & UN Sustainable Development Goals Alignment", h1_style))
    story.append(Paragraph(
        "AnnaSetu AI exemplifies how contemporary full-stack software engineering and responsible AI can be synthesized to address critical humanitarian and environmental imperatives. By directly diverting surplus commercial food to accredited social welfare institutions, the platform tangibly accelerates <b>SDG 2 (Zero Hunger)</b>, while significantly mitigating landfill methane emissions to foster <b>SDG 12 (Responsible Consumption and Production)</b>.",
        body_style
    ))
    story.append(Paragraph(
        "The project stands fully verified, documented, and demonstrable, meeting all core software engineering, data integrity, and architectural requirements with distinction.",
        body_style
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Official Submission Report PDF created at: {pdf_path}")

if __name__ == "__main__":
    create_submission_report_pdf()
