"""
Generate the ultimate, comprehensive publication-quality PDF guide for AnnaSetu AI.
Explains every single section, screen, form field, button, and indicator across the website in plain English.
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
            self.drawString(54, 755, "AnnaSetu AI — Plain English Website Field & Section Guide")
            self.drawRightString(558, 755, "UN SDG 2 & SDG 12")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.6)
            self.line(54, 747, 558, 747)
        
        # Footer (all pages)
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 34, page_str)
        self.drawString(54, 34, "“Share More. Waste Less. Feed Hope.” | SDG 2 (Zero Hunger) & SDG 12")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.6)
        self.line(54, 46, 558, 46)
        self.restoreState()


def create_comprehensive_pdf():
    pdf_path = "AnnaSetu_AI_Complete_Website_Field_Guide.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Brand Palette
    c_primary = colors.HexColor("#064e3b")    # Deep Forest Emerald
    c_secondary = colors.HexColor("#047857")  # Emerald Green
    c_accent = colors.HexColor("#b45309")     # Warm Amber
    c_dark = colors.HexColor("#0f172a")       # Slate 900
    c_body = colors.HexColor("#334155")       # Slate 700
    c_rose = colors.HexColor("#9f1239")       # Wine Red
    c_purple = colors.HexColor("#6b21a8")     # Royal Purple
    c_border = colors.HexColor("#cbd5e1")
    c_bg_light = colors.HexColor("#f8fafc")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
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
        fontSize=14,
        leading=18,
        textColor=c_primary,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_secondary,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_body,
        spaceAfter=6
    )

    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    td_bold = ParagraphStyle(
        'TableBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=c_dark
    )

    td_text = ParagraphStyle(
        'TableText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=c_body
    )

    story = []

    # ------------------ COVER / TITLE BANNER ------------------
    story.append(Paragraph("AnnaSetu AI — Complete Website Field Guide", title_style))
    story.append(Paragraph("“Share More. Waste Less. Feed Hope.” — Plain-English Reference for Every Screen & Field", tagline_style))

    summary_box_html = (
        "<b>Platform Context:</b> Surplus Food Redistribution Architecture &nbsp;|&nbsp; "
        "<b>SDG Goals:</b> SDG 2 (Zero Hunger) & SDG 12 (Responsible Consumption)<br/>"
        "<b>Purpose of this Guide:</b> This document gives you an easy, intuitive explanation of <b>every single page, form field, button, status badge, and AI co-pilot feature</b> across the entire AnnaSetu AI platform. Use this for presentation walkthroughs, user orientation, and technical review."
    )
    meta_table = Table([[Paragraph(summary_box_html, body_style)]], colWidths=[504])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ecfdf5")),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#a7f3d0")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # ------------------ SECTION 1: GLOBAL SITE ELEMENTS ------------------
    story.append(Paragraph("1. Global Platform Layout & Persistent Controls", h1_style))
    story.append(Paragraph("These elements are always visible at the top, bottom, or corners of every page:", body_style))

    global_data = [
        [Paragraph("Screen Element", th_style), Paragraph("Where to Find It", th_style), Paragraph("Plain-English Explanation & Function", th_style)],
        [
            Paragraph("Food Safety Alert Banner", td_bold),
            Paragraph("Top banner (amber bar above the navbar)", td_text),
            Paragraph("Reminds all users that AnnaSetu AI coordinates logistics and traceability, but food safety relies on donor hygienic preparation and temperature holding under FSSAI rules.", td_text)
        ],
        [
            Paragraph("Main Navbar", td_bold),
            Paragraph("Header on every screen", td_text),
            Paragraph("Displays brand logo, public links (Home, How It Works, Impact, About), quick sign-in/register buttons, and current user avatar when logged in.", td_text)
        ],
        [
            Paragraph("Role-Based Sub-Navbar (RoleNav)", td_bold),
            Paragraph("Sub-bar below main navbar (when logged in)", td_text),
            Paragraph("Automatically switches based on user role: Donors see kitchen links; NGOs see search/request links; Volunteers see courier runs; Admins see governance controls.", td_text)
        ],
        [
            Paragraph("Notification Bell Panel", td_bold),
            Paragraph("Top right of navbar", td_text),
            Paragraph("Live unread notification counter. Alerts donors when an NGO requests food, alerts NGOs when food is en route, and alerts couriers of new runs.", td_text)
        ],
        [
            Paragraph("Floating AI Assistant Widget", td_bold),
            Paragraph("Bottom-right corner (sparkle robot icon)", td_text),
            Paragraph("Interactive AI Co-pilot modal. Answers questions about food safety rules, explains statuses, or provides role-scoped guidance.", td_text)
        ],
        [
            Paragraph("Global Footer", td_bold),
            Paragraph("Bottom of every screen", td_text),
            Paragraph("Includes links to Trust & Privacy policy, Terms of Service, SDG 2 / SDG 12 alignment statement, and academic project credits.", td_text)
        ]
    ]
    t_global = Table(global_data, colWidths=[120, 110, 274])
    t_global.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_global)
    story.append(Spacer(1, 12))

    # ------------------ SECTION 2: AUTHENTICATION & REGISTRATION ------------------
    story.append(Paragraph("2. Registration & Sign-In Fields (`/register` & `/login`)", h1_style))
    story.append(Paragraph("How users establish their identities and organizations on the platform:", body_style))

    auth_data = [
        [Paragraph("Field Name", th_style), Paragraph("Input Type", th_style), Paragraph("What It Means & How It Is Used", th_style)],
        [
            Paragraph("Full Name", td_bold),
            Paragraph("Text", td_text),
            Paragraph("The user's official legal name. Displayed on dispatch handover receipts and delivery sign-offs.", td_text)
        ],
        [
            Paragraph("Email Address", td_bold),
            Paragraph("Email", td_text),
            Paragraph("Your login username and primary notification destination. Must be unique in the system.", td_text)
        ],
        [
            Paragraph("Password", td_bold),
            Paragraph("Password", td_text),
            Paragraph("Secured with Argon2 password hashing. Plaintext passwords are never stored in the database.", td_text)
        ],
        [
            Paragraph("Phone Number", td_bold),
            Paragraph("Tel", td_text),
            Paragraph("Critical mobile contact for logistics coordination. Shared only between matched donor, volunteer courier, and recipient.", td_text)
        ],
        [
            Paragraph("I am registering as (Role)", td_bold),
            Paragraph("Dropdown", td_text),
            Paragraph("Choose between: <b>Food Donor</b> (hotels, caterers), <b>Recipient Organization</b> (shelters, NGOs), or <b>Volunteer Courier</b>. (Admin role cannot be self-selected).", td_text)
        ],
        [
            Paragraph("Organization Name", td_bold),
            Paragraph("Text", td_text),
            Paragraph("Legal name of the restaurant, university dining hall, shelter, or non-profit trust.", td_text)
        ],
        [
            Paragraph("Organization Type", td_bold),
            Paragraph("Dropdown", td_text),
            Paragraph("Selects classification: Restaurant, Hotel, College Hostel, Corporate Cafeteria, NGO, Community Kitchen, or Shelter.", td_text)
        ],
        [
            Paragraph("Registration / License ID", td_bold),
            Paragraph("Text", td_text),
            Paragraph("FSSAI License number (for donors) or 12A/80G/Darpan Registration Number (for recipient NGOs). Key for regulatory audits.", td_text)
        ],
        [
            Paragraph("Physical Street Address", td_bold),
            Paragraph("Text", td_text),
            Paragraph("Physical location where food is cooked or where shelter beneficiaries are fed. Used to compute proximity distances.", td_text)
        ],
        [
            Paragraph("Daily Capacity (Servings)", td_bold),
            Paragraph("Number", td_text),
            Paragraph("Maximum plates/meals the shelter can handle per day. <b>Prevents Overbooking:</b> An NGO cannot request more food than it can distribute.", td_text)
        ],
        [
            Paragraph("Service Radius (km)", td_bold),
            Paragraph("Number", td_text),
            Paragraph("Maximum travel distance the organization can cover. Proximity matching filters out listings beyond this radius.", td_text)
        ],
        [
            Paragraph("1-Click Quick Demo Login", td_bold),
            Paragraph("Buttons on `/login`", td_text),
            Paragraph("Preset buttons that instantly fill credentials for Admin, Hotel Donor, Hostel Donor, Verified NGO, Pending NGO, or Courier.", td_text)
        ]
    ]
    t_auth = Table(auth_data, colWidths=[120, 75, 309])
    t_auth.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_secondary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_auth)
    story.append(Spacer(1, 12))

    # ------------------ SECTION 3: DONOR POST SURPLUS FORM ------------------
    story.append(Paragraph("3. Donor Surplus Food Listing Form (`/donor/listings/new`)", h1_style))
    story.append(Paragraph("Every field in the surplus food donation creation screen explained in plain language:", body_style))

    post_data = [
        [Paragraph("Form Field", th_style), Paragraph("Options / Format", th_style), Paragraph("Easy Explanation & Purpose", th_style)],
        [
            Paragraph("Food Title", td_bold),
            Paragraph("Text (e.g. 'Dal Makhani & Jeera Rice')", td_text),
            Paragraph("The exact name of the surplus dish or item. AI reads this to identify potential allergens and classify food type.", td_text)
        ],
        [
            Paragraph("Detailed Description", td_bold),
            Paragraph("Text Area", td_text),
            Paragraph("Context on food preparation, packaging type (sealed thermal containers, foil trays), and freshness notes.", td_text)
        ],
        [
            Paragraph("Food Category", td_bold),
            Paragraph("Dropdown: Prepared Meals, Bakery, Produce, Packaged Food, Dairy, Other", td_text),
            Paragraph("Classifies the type of food. Cooked prepared meals require rapid hot/cold holding, while raw produce has longer tolerance.", td_text)
        ],
        [
            Paragraph("Quantity & Unit", td_bold),
            Paragraph("Number + Unit (kg, liters, packets, portions)", td_text),
            Paragraph("Exact measurable amount available. Managed with row-level database locking to guarantee zero double-booking.", td_text)
        ],
        [
            Paragraph("Estimated Servings", td_bold),
            Paragraph("Number of people (e.g. 50 meals)", td_text),
            Paragraph("How many hungry individuals this batch can feed. Matched against recipient shelter capacity.", td_text)
        ],
        [
            Paragraph("Preparation Date & Time", td_bold),
            Paragraph("Datetime picker", td_text),
            Paragraph("When the food was cooked or packaged. Cannot be set in the future.", td_text)
        ],
        [
            Paragraph("Best-Before / Expiry", td_bold),
            Paragraph("Datetime picker", td_text),
            Paragraph("Safe consumption cutoff. Listings automatically transition to 'EXPIRED' past this timestamp.", td_text)
        ],
        [
            Paragraph("Storage Conditions", td_bold),
            Paragraph("• hot_holding (&ge;60°C)<br/>• refrigerated (&le;5°C)<br/>• ambient (room temp)<br/>• frozen (&le;-18°C)", td_text),
            Paragraph("<b>FSSAI Temperature Mandate:</b> Dictates how couriers must transport the batch (e.g. insulated thermal boxes vs chilled ice packs).", td_text)
        ],
        [
            Paragraph("Known Allergens", td_bold),
            Paragraph("Text (e.g. 'Dairy, Gluten, Peanuts')", td_text),
            Paragraph("Warns recipient shelters so they do not distribute items with allergens to sensitive children or elderly residents.", td_text)
        ],
        [
            Paragraph("Dietary Attributes", td_bold),
            Paragraph("Dropdown: vegetarian, vegan, non_vegetarian, jain, halal", td_text),
            Paragraph("Ensures communities with specific religious or cultural dietary requirements receive appropriate food.", td_text)
        ],
        [
            Paragraph("Pickup Address", td_bold),
            Paragraph("Street address (min 5 chars)", td_text),
            Paragraph("Where courier collects food (e.g., 'Kitchen Loading Bay 2, 41/1 MG Road').", td_text)
        ],
        [
            Paragraph("Pickup Available From", td_bold),
            Paragraph("Datetime picker", td_text),
            Paragraph("Start of collection window. Prevents couriers from arriving while the kitchen is still packing the batch.", td_text)
        ],
        [
            Paragraph("Pickup Deadline", td_bold),
            Paragraph("Datetime picker", td_text),
            Paragraph("Must be collected before this cutoff. Used by the matching algorithm to calculate schedule urgency.", td_text)
        ],
        [
            Paragraph("Contact Name & Phone", td_bold),
            Paragraph("Text & Phone number", td_text),
            Paragraph("On-duty chef or supervisor who hands over food to the volunteer courier.", td_text)
        ],
        [
            Paragraph("Food Safety Declaration", td_bold),
            Paragraph("Mandatory Checkbox", td_text),
            Paragraph("<b>Legal Accountability:</b> Donor verifies food was prepared hygienically and stored safely. Form cannot be submitted without this.", td_text)
        ],
        [
            Paragraph("AI Smart Suggestions", td_bold),
            Paragraph("Co-pilot button", td_text),
            Paragraph("Calls Gemini AI (or resilient rule fallback) to auto-fill category, allergens, and recommend improved packaging details.", td_text)
        ]
    ]
    t_post = Table(post_data, colWidths=[120, 110, 274])
    t_post.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_post)
    story.append(Spacer(1, 12))

    # ------------------ SECTION 4: INTELLIGENT MATCHING ------------------
    story.append(Paragraph("4. Intelligent Proximity Matching & Scoring (0–100)", h1_style))
    story.append(Paragraph("On the Listing Details screen (`/donor/listings/:id`), donors see transparent match recommendation cards:", body_style))

    score_data = [
        [Paragraph("Score Component", th_style), Paragraph("Points Allocated", th_style), Paragraph("How It Works in Plain English", th_style)],
        [
            Paragraph("Geodesic Proximity (Haversine Formula)", td_bold),
            Paragraph("Up to 40 Points", td_text),
            Paragraph("Calculates straight-line earth distance between kitchen and shelter. Distance &le; 5 km gets max 40 pts; 10 km gets 25 pts; &gt; 20 km gets 0 pts.", td_text)
        ],
        [
            Paragraph("Shelter Capacity Fit", td_bold),
            Paragraph("Up to 30 Points", td_text),
            Paragraph("Compares batch servings with NGO's registered daily distribution capacity. Prevents sending 300 meals to a 40-bed facility.", td_text)
        ],
        [
            Paragraph("Schedule Urgency Window", td_bold),
            Paragraph("Up to 20 Points", td_text),
            Paragraph("Prioritizes meals with short remaining shelf life (&lt;3 hours) so food is transported before quality deteriorates.", td_text)
        ],
        [
            Paragraph("Food Category & Dietary Match", td_bold),
            Paragraph("Up to 10 Points", td_text),
            Paragraph("Matches ready-to-eat cooked food to shelters with immediate dining rooms, and raw produce to kitchens with cooks.", td_text)
        ]
    ]
    t_score = Table(score_data, colWidths=[130, 90, 284])
    t_score.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_accent),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_score)
    story.append(Spacer(1, 12))

    # ------------------ SECTION 5: RECIPIENT NGO CATALOG ------------------
    story.append(Paragraph("5. Recipient NGO Catalog & Food Requests (`/recipient/donations`)", h1_style))
    story.append(Paragraph("How verified charities locate and reserve surplus food batches:", body_style))

    ngo_data = [
        [Paragraph("Feature / Field", th_style), Paragraph("Type", th_style), Paragraph("Plain-English Explanation", th_style)],
        [
            Paragraph("AI Natural Language Search", td_bold),
            Paragraph("Smart Query Input", td_text),
            Paragraph("Type phrases like <i>'Need 50 vegetarian meals for dinner in Indiranagar'</i>. The AI parses category, dietary tag, and urgency into live database filters.", td_text)
        ],
        [
            Paragraph("Category & Dietary Filters", td_bold),
            Paragraph("Filter Dropdowns", td_text),
            Paragraph("Manually filter by Prepared Meals, Bakery, Produce, Vegetarian, Vegan, Jain, etc.", td_text)
        ],
        [
            Paragraph("Urgent Pickup Only Toggle", td_bold),
            Paragraph("Checkbox Toggle", td_text),
            Paragraph("Filters exclusively for food batches expiring within the next 3 hours requiring immediate dispatch.", td_text)
        ],
        [
            Paragraph("Listing Card Information", td_bold),
            Paragraph("Display Card", td_text),
            Paragraph("Shows donor organization, distance in kilometers, servings count, storage temperature requirement, and deadline countdown.", td_text)
        ],
        [
            Paragraph("Quantity Requested Modal", td_bold),
            Paragraph("Modal Input", td_text),
            Paragraph("Shelters can request the full batch or partial batch based on current need. Enforces atomicity to avoid overbooking.", td_text)
        ],
        [
            Paragraph("Shelter Notes for Donor", td_bold),
            Paragraph("Text Field", td_text),
            Paragraph("Notes for the donor kitchen (e.g., 'Will distribute to 45 night shelter residents at 7:30 PM').", td_text)
        ],
        [
            Paragraph("Accreditation Gate", td_bold),
            Paragraph("Security Barrier", td_text),
            Paragraph("<b>Unverified NGOs cannot request live food.</b> They must upload 12A/80G/Darpan certificates and receive admin approval first.", td_text)
        ]
    ]
    t_ngo = Table(ngo_data, colWidths=[120, 90, 294])
    t_ngo.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_secondary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_ngo)
    story.append(Spacer(1, 12))

    # ------------------ SECTION 6: VOLUNTEER COURIER WORKFLOW ------------------
    story.append(Paragraph("6. Volunteer Courier Logistics (`/volunteer/tasks`)", h1_style))
    story.append(Paragraph("Step-by-step progress tracking for transportation and food delivery:", body_style))

    vol_data = [
        [Paragraph("Screen / Step", th_style), Paragraph("Status Transition", th_style), Paragraph("Plain-English Explanation & Action", th_style)],
        [
            Paragraph("Available to Claim Tab", td_bold),
            Paragraph("`UNASSIGNED`", td_text),
            Paragraph("Open pool of approved donation runs. Any verified volunteer can click <b>'Claim This Run'</b> to self-assign.", td_text)
        ],
        [
            Paragraph("Accept Assignment", td_bold),
            Paragraph("`ASSIGNED` &rarr; `ACCEPTED`", td_text),
            Paragraph("Volunteer confirms they have an insulated carrier box and will proceed to the donor kitchen.", td_text)
        ],
        [
            Paragraph("Confirm Food Picked Up", td_bold),
            Paragraph("`ACCEPTED` &rarr; `PICKED_UP`", td_text),
            Paragraph("Volunteer collects food at donor kitchen, inspects temperature and seal, and marks food in transit. Recipient shelter is notified.", td_text)
        ],
        [
            Paragraph("Confirm Delivery Complete", td_bold),
            Paragraph("`PICKED_UP` &rarr; `COMPLETED`", td_text),
            Paragraph("Volunteer hands over food at shelter receiving bay. Shelter signs off. Database increments servings salvaged and carbon saved.", td_text)
        ],
        [
            Paragraph("Courier Transit Notes", td_bold),
            Paragraph("Text Field", td_text),
            Paragraph("Field for volunteer to record audit details (e.g. 'Food collected in 3 thermal crates at 65°C; handed to shelter supervisor').", td_text)
        ],
        [
            Paragraph("Transport Charter Pledge", td_bold),
            Paragraph("Checklist on `/volunteer/profile`", td_text),
            Paragraph("Volunteer signs charter committing to thermal chain integrity (&gt;60°C hot, &lt;5°C chilled) and direct, prompt deliveries.", td_text)
        ]
    ]
    t_vol = Table(vol_data, colWidths=[120, 110, 274])
    t_vol.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_purple),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_vol)
    story.append(Spacer(1, 12))

    # ------------------ SECTION 7: ADMIN COMMAND CENTER ------------------
    story.append(Paragraph("7. Administrator Command Center (`/admin`)", h1_style))
    story.append(Paragraph("Oversight tools to guarantee institutional trust, food safety, and compliance:", body_style))

    adm_data = [
        [Paragraph("Admin Section", th_style), Paragraph("Path", th_style), Paragraph("Plain-English Purpose & Action", th_style)],
        [
            Paragraph("Platform Oversight Stats", td_bold),
            Paragraph("`/admin/dashboard`", td_text),
            Paragraph("High-level KPI metric cards (Users, Verified NGOs, Active Listings, Open Safety Tickets, Pickup Completion Rate) and Recharts distribution diagrams.", td_text)
        ],
        [
            Paragraph("NGO Accreditation Queue", td_bold),
            Paragraph("`/admin/verifications`", td_text),
            Paragraph("Inspects submitted 12A/80G/Darpan certificates. Auditor clicks <b>Approve & Verify</b> or <b>Reject</b> with feedback notes.", td_text)
        ],
        [
            Paragraph("Food Safety Incidents", td_bold),
            Paragraph("`/admin/safety-reports`", td_text),
            Paragraph("Queue of spoilage or temperature complaints. Classified by severity (Low, Medium, High, Critical). Admin marks as Investigating, Resolved, or Dismissed.", td_text)
        ],
        [
            Paragraph("Catalog Moderation", td_bold),
            Paragraph("`/admin/listings`", td_text),
            Paragraph("Platform-wide listing audit. Admin can cancel or flag any non-compliant food batch for immediate removal from circulation.", td_text)
        ],
        [
            Paragraph("User Account Directory", td_bold),
            Paragraph("`/admin/users`", td_text),
            Paragraph("Directory of all donors, NGOs, and couriers. Admin can toggle Active/Suspended status (admin self-suspension prevented).", td_text)
        ],
        [
            Paragraph("Immutable Audit Ledger", td_bold),
            Paragraph("`/admin/audit-logs`", td_text),
            Paragraph("Tamper-evident record of all logins, listings created, reservations approved, and delivery transitions with timestamps and IP addresses.", td_text)
        ]
    ]
    t_adm = Table(adm_data, colWidths=[120, 95, 289])
    t_adm.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_rose),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_adm)
    story.append(Spacer(1, 12))

    # ------------------ SECTION 8: IMPACT METRICS ------------------
    story.append(Paragraph("8. Live Impact Dashboard (`/impact`)", h1_style))
    story.append(Paragraph("Calculated directly from database tables with zero fabricated figures:", body_style))

    imp_data = [
        [Paragraph("Metric Displayed", th_style), Paragraph("Underlying Formula", th_style), Paragraph("Significance to UN SDGs", th_style)],
        [
            Paragraph("Total Servings Redistributed", td_bold),
            Paragraph("`SUM(estimated_servings)` where `status = 'COMPLETED'`", td_text),
            Paragraph("Direct contribution to <b>SDG 2 (Zero Hunger)</b>: plates of food fed to people in need.", td_text)
        ],
        [
            Paragraph("Quantity Diverted (kg)", td_bold),
            Paragraph("`SUM(quantity)` converted to kg for completed runs", td_text),
            Paragraph("Direct contribution to <b>SDG 12 (Responsible Consumption)</b>: organic waste kept out of landfills.", td_text)
        ],
        [
            Paragraph("Completion Rate (%)", td_bold),
            Paragraph("`(Completed Pickups / Total Created Pickups) * 100`", td_text),
            Paragraph("Logistical efficiency index indicating volunteer reliability.", td_text)
        ],
        [
            Paragraph("Category Breakdown", td_bold),
            Paragraph("Pie & Bar chart by Prepared Meals, Bakery, Produce, etc.", td_text),
            Paragraph("Reveals the balance between banquet cooked surplus and raw grocery surplus.", td_text)
        ],
        [
            Paragraph("7-Day Redistribution Trend", td_bold),
            Paragraph("Day-by-day volume trend line chart", td_text),
            Paragraph("Displays growth in daily surplus food redistribution volume across the city.", td_text)
        ]
    ]
    t_imp = Table(imp_data, colWidths=[120, 150, 234])
    t_imp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_imp)
    story.append(Spacer(1, 12))

    # ------------------ SECTION 9: DEMO ACCOUNTS TABLE ------------------
    story.append(Paragraph("9. Pre-Seeded Demonstration Accounts Summary", h1_style))
    story.append(Paragraph("Use these accounts for testing, role evaluation, and demonstration walkthroughs:", body_style))

    acc_data = [
        [Paragraph("Role / Persona", th_style), Paragraph("Login Email", th_style), Paragraph("Password", th_style), Paragraph("What to Test With This Account", th_style)],
        [Paragraph("Admin", td_bold), Paragraph("admin@annasetu.ai", td_text), Paragraph("Admin@123456", td_text), Paragraph("Approve NGO verifications, triage safety reports, inspect audit trail.", td_text)],
        [Paragraph("Donor (Hotel)", td_bold), Paragraph("donor.taj@annasetu.ai", td_text), Paragraph("Demo@123456", td_text), Paragraph("Post surplus meals with AI co-pilot, review match scores, accept requests.", td_text)],
        [Paragraph("Donor (Hostel)", td_bold), Paragraph("donor.hostel@annasetu.ai", td_text), Paragraph("Demo@123456", td_text), Paragraph("Post bulk cafeteria meals, view kitchen history.", td_text)],
        [Paragraph("Verified NGO", td_bold), Paragraph("ngo.hope@annasetu.ai", td_text), Paragraph("Demo@123456", td_text), Paragraph("Search food using AI natural language query, request surplus batches.", td_text)],
        [Paragraph("Community Kitchen", td_bold), Paragraph("ngo.annapurna@annasetu.ai", td_text), Paragraph("Demo@123456", td_text), Paragraph("High daily capacity shelter meal requests.", td_text)],
        [Paragraph("Pending NGO", td_bold), Paragraph("ngo.samarpan@annasetu.ai", td_text), Paragraph("Demo@123456", td_text), Paragraph("View verification pending alert gate preventing unverified meal requests.", td_text)],
        [Paragraph("Volunteer Courier", td_bold), Paragraph("volunteer.rahul@annasetu.ai", td_text), Paragraph("Demo@123456", td_text), Paragraph("Claim runs, progress delivery lifecycle (`ASSIGNED` &rarr; `ACCEPTED` &rarr; `PICKED_UP` &rarr; `COMPLETED`).", td_text)]
    ]
    t_acc = Table(acc_data, colWidths=[90, 115, 75, 224])
    t_acc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_secondary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg_light])
    ]))
    story.append(t_acc)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Comprehensive PDF built successfully at: {pdf_path}")

if __name__ == "__main__":
    create_comprehensive_pdf()
