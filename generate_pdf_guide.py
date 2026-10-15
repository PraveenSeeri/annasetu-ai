"""
Script to generate the comprehensive, publication-quality AnnaSetu AI Field Guide PDF.
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
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (on pages after cover/page 1)
        if self._pageNumber > 1:
            self.drawString(54, 755, "AnnaSetu AI — Complete Field-by-Field Website Guide")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 747, 558, 747)
        
        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_text)
        self.drawString(54, 36, "AnnaSetu AI Platform | SDG 2 (Zero Hunger) & SDG 12")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        self.restoreState()


def build_pdf(filename="AnnaSetu_AI_Complete_Field_Guide.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#064e3b")    # Deep emerald
    secondary_color = colors.HexColor("#047857")  # Emerald green
    accent_color = colors.HexColor("#b45309")     # Warm amber
    dark_slate = colors.HexColor("#0f172a")
    body_color = colors.HexColor("#334155")
    bg_light = colors.HexColor("#f8fafc")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=secondary_color,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=primary_color,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=secondary_color,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=body_color,
        spaceAfter=6
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=dark_slate
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=body_color
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#78350f")
    )

    story = []

    # Title & Metadata Cover Box
    story.append(Paragraph("AnnaSetu AI — Platform Field Guide", title_style))
    story.append(Paragraph("“Share More. Waste Less. Feed Hope.” | Complete Plain-English Explanation of Every Screen & Field", subtitle_style))
    
    meta_html = (
        "<b>Platform:</b> AnnaSetu AI Surplus Food Coordination &nbsp;|&nbsp; "
        "<b>Focus:</b> UN Sustainable Development Goals: SDG 2 (Zero Hunger) & SDG 12 (Responsible Consumption)<br/>"
        "<b>Scope:</b> Every form field, button, status code, calculation, and safety check explained simply for donors, NGOs, volunteers, and evaluators."
    )
    meta_table = Table([[Paragraph(meta_html, body_style)]], colWidths=[504])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ecfdf5")),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#a7f3d0")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # SECTION 1: USER ROLES
    story.append(Paragraph("1. User Roles & Account Capabilities", h1_style))
    story.append(Paragraph("AnnaSetu AI enforces strict Role-Based Access Control (RBAC). Every user interacts with a tailored interface designed around their real-world responsibilities:", body_style))

    roles_data = [
        [Paragraph("Role", table_header_style), Paragraph("Who Uses It", table_header_style), Paragraph("What They Can Do & Key Restrictions", table_header_style)],
        [
            Paragraph("Food Donor", table_cell_bold),
            Paragraph("Restaurants, banquet halls, college hostel kitchens, catering services, corporate cafeterias.", table_cell_style),
            Paragraph("Post surplus food batches; use AI categorization; view matched NGOs; approve reservation requests; monitor courier pickup. Cannot view other donors' listings.", table_cell_style)
        ],
        [
            Paragraph("Recipient Organization", table_cell_bold),
            Paragraph("Verified NGOs, registered community kitchens, homeless shelters, child/elder relief homes.", table_cell_style),
            Paragraph("Search food batches via AI natural language; reserve meals within daily capacity. <b>Security Gate:</b> Must be admin-verified with 12A/80G/Darpan before reserving.", table_cell_style)
        ],
        [
            Paragraph("Volunteer Courier", table_cell_bold),
            Paragraph("Good Samaritan volunteer drivers, community youth, vehicle owners with transport crates.", table_cell_style),
            Paragraph("Browse unassigned pickup runs across Bengaluru; claim runs; confirm kitchen collection; confirm shelter handover. Cannot view private donor finances.", table_cell_style)
        ],
        [
            Paragraph("Administrator", table_cell_bold),
            Paragraph("Central compliance team, food safety auditors, platform moderators.", table_cell_style),
            Paragraph("Approve/reject NGO accreditation; investigate food safety/spoilage alerts; moderate listings; inspect immutable tamper-evident audit logs. Seeded only via secure config.", table_cell_style)
        ]
    ]
    t_roles = Table(roles_data, colWidths=[100, 140, 264])
    t_roles.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))
    story.append(t_roles)
    story.append(Spacer(1, 14))

    # SECTION 2: AUTHENTICATION & ONBOARDING
    story.append(Paragraph("2. Registration & Account Setup Fields (`/register`)", h1_style))
    story.append(Paragraph("When an organization or volunteer registers, each field serves a specific security and operational purpose:", body_style))

    reg_data = [
        [Paragraph("Form Field", table_header_style), Paragraph("Easy Plain-English Meaning", table_header_style), Paragraph("Why It Matters & Rules", table_header_style)],
        [Paragraph("Full Name", table_cell_bold), Paragraph("Contact person's full official name (e.g., Ramesh Kumar).", table_cell_style), Paragraph("Used on delivery invoices and handover verification.", table_cell_style)],
        [Paragraph("Email Address", table_cell_bold), Paragraph("Login username and notification email destination.", table_cell_style), Paragraph("Must be unique; used to send critical pickup alerts.", table_cell_style)],
        [Paragraph("Password", table_cell_bold), Paragraph("Secure password (min 6 characters).", table_cell_style), Paragraph("Hashed using Argon2 algorithm; never stored in plaintext.", table_cell_style)],
        [Paragraph("Phone Number", table_cell_bold), Paragraph("Direct mobile number for coordinating pickup handovers.", table_cell_style), Paragraph("Shared strictly between donor, assigned volunteer, and recipient.", table_cell_style)],
        [Paragraph("I am registering as", table_cell_bold), Paragraph("Account role dropdown (Food Donor, Recipient NGO, Volunteer).", table_cell_style), Paragraph("Determines dashboard navigation, allowed actions, and APIs.", table_cell_style)],
        [Paragraph("Organization Name", table_cell_bold), Paragraph("Legal name of hotel, restaurant, NGO, or shelter.", table_cell_style), Paragraph("Required for Donors and Recipients; displayed on match badges.", table_cell_style)],
        [Paragraph("Organization Type", table_cell_bold), Paragraph("Type of establishment (e.g. Restaurant, Hotel, NGO, Shelter).", table_cell_style), Paragraph("Helps the AI matching engine recommend suitable meal types.", table_cell_style)],
        [Paragraph("Registration / License No.", table_cell_bold), Paragraph("FSSAI license number (donor) or 12A/80G/Darpan ID (NGO).", table_cell_style), Paragraph("Crucial trust verification field for compliance auditing.", table_cell_style)],
        [Paragraph("Address & City", table_cell_bold), Paragraph("Physical street address where kitchen or shelter is located.", table_cell_style), Paragraph("Used to calculate road distance and dispatch volunteers.", table_cell_style)],
        [Paragraph("Daily Capacity (Servings)", table_cell_bold), Paragraph("Max meals the NGO shelter can safely distribute per day.", table_cell_style), Paragraph("<b>Prevents Overbooking:</b> An NGO with capacity 100 cannot request 500 meals.", table_cell_style)],
        [Paragraph("Service Radius (km)", table_cell_bold), Paragraph("Maximum distance the NGO or volunteer can travel (default 15 km).", table_cell_style), Paragraph("Limits matches to food within reasonable travel time.", table_cell_style)],
    ]
    t_reg = Table(reg_data, colWidths=[120, 180, 204])
    t_reg.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))
    story.append(t_reg)
    story.append(Spacer(1, 14))

    # SECTION 3: DONOR POST SURPLUS LISTING FORM
    story.append(Paragraph("3. Donor Surplus Food Listing Form (`/donor/listings/new`)", h1_style))
    story.append(Paragraph("This is the core donation entry form. Food safety rules are strictly enforced over raw AI output:", body_style))

    listing_data = [
        [Paragraph("Field Name", table_header_style), Paragraph("Explanation & Supported Values", table_header_style), Paragraph("Food Safety & System Impact", table_header_style)],
        [Paragraph("Food Title", table_cell_bold), Paragraph("Clear name of food (e.g. 'Fresh Paneer Butter Masala & Jeera Rice').", table_cell_style), Paragraph("Must be descriptive. The AI uses this to detect allergens.", table_cell_style)],
        [Paragraph("Food Category", table_cell_bold), Paragraph("Dropdown: Prepared Meals, Bakery, Produce, Packaged Food, Dairy, Other.", table_cell_style), Paragraph("Determines allowable transit time and storage protocols.", table_cell_style)],
        [Paragraph("Quantity & Unit", table_cell_bold), Paragraph("Numeric amount (e.g. 15.0) and unit (kg, liters, packets, portions).", table_cell_style), Paragraph("Must be greater than 0. Tracked atomically in inventory.", table_cell_style)],
        [Paragraph("Estimated Servings", table_cell_bold), Paragraph("Number of individual people this batch can feed (e.g. 45 meals).", table_cell_style), Paragraph("Matched against NGO recipient shelter capacity to prevent waste.", table_cell_style)],
        [Paragraph("Preparation Date & Time", table_cell_bold), Paragraph("Exact date and time when the meal was prepared/cooked in kitchen.", table_cell_style), Paragraph("Used to calculate freshness window. Cannot be in the future.", table_cell_style)],
        [Paragraph("Expiry / Best-Before", table_cell_bold), Paragraph("Time cutoff after which food must NOT be consumed.", table_cell_style), Paragraph("Listings expire automatically in the database past this date.", table_cell_style)],
        [Paragraph("Storage Conditions", table_cell_bold), Paragraph("<b>hot_holding</b> (&ge;60°C)<br/><b>refrigerated</b> (&le;5°C)<br/><b>ambient</b> (room temp)<br/><b>frozen</b> (&le;-18°C)", table_cell_style), Paragraph("<b>FSSAI Mandate:</b> Hot foods must stay hot, chilled must stay cold during transit. Couriers check this on arrival.", table_cell_style)],
        [Paragraph("Known Allergens", table_cell_bold), Paragraph("Text tag of allergens present (e.g. 'Dairy, Gluten, Nuts').", table_cell_style), Paragraph("Protects beneficiaries with severe dietary allergies.", table_cell_style)],
        [Paragraph("Dietary Attributes", table_cell_bold), Paragraph("Dropdown: vegetarian, vegan, non_vegetarian, jain, halal.", table_cell_style), Paragraph("Allows shelters with strict dietary guidelines to filter accurately.", table_cell_style)],
        [Paragraph("Pickup Street Address", table_cell_bold), Paragraph("Exact pickup location (e.g., 'Grand Palace Hotel, MG Road Kitchen Bay 2').", table_cell_style), Paragraph("Coordinates are used by the Haversine formula for proximity.", table_cell_style)],
        [Paragraph("Pickup Available From", table_cell_bold), Paragraph("Earliest time food is packaged and ready for collection.", table_cell_style), Paragraph("Ensures volunteers don't arrive before food is packed.", table_cell_style)],
        [Paragraph("Pickup Deadline", table_cell_bold), Paragraph("Latest time courier can pick up food before kitchen closes.", table_cell_style), Paragraph("<b>Strict Rule:</b> Must be in the future. Urgent if &lt;3 hours away.", table_cell_style)],
        [Paragraph("Contact Name & Phone", table_cell_bold), Paragraph("Duty chef or banquet manager on site (e.g. 'Chef Ramesh', '9845012345').", table_cell_style), Paragraph("Direct communication link visible ONLY to matched participants.", table_cell_style)],
        [Paragraph("Food Safety Declaration", table_cell_bold), Paragraph("Mandatory confirmation checkbox: <i>'I confirm this food has been prepared hygienically and is safe for consumption.'</i>", table_cell_style), Paragraph("<b>Legal Requirement:</b> Listing CANNOT be submitted without this confirmation. Preserves audit accountability.", table_cell_style)],
        [Paragraph("AI Smart Suggestions", table_cell_bold), Paragraph("Clickable co-pilot button beside title/description.", table_cell_style), Paragraph("Uses Gemini AI (or rule fallback) to auto-fill category, detect hidden allergens, and improve packaging notes.", table_cell_style)]
    ]
    t_listing = Table(listing_data, colWidths=[120, 190, 194])
    t_listing.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))
    story.append(t_listing)
    story.append(Spacer(1, 14))

    # SECTION 4: INTELLIGENT MATCHING EXPLAINED
    story.append(Paragraph("4. Intelligent Proximity Matching & Scoring (0–100)", h1_style))
    story.append(Paragraph("AnnaSetu AI does not use a black-box opaque algorithm. Every recommendation displays transparent breakdown factors:", body_style))

    match_factors = [
        [Paragraph("Scoring Factor", table_header_style), Paragraph("Weight / Points", table_header_style), Paragraph("What It Evaluates in Plain English", table_header_style)],
        [Paragraph("Geodesic Distance (Haversine)", table_cell_bold), Paragraph("Up to 40 points", table_cell_style), Paragraph("Proximity between donor kitchen and NGO shelter. Closer = higher score (e.g. &lt;5 km gets max points). Eliminates long transit times that risk spoilage.", table_cell_style)],
        [Paragraph("Shelter Daily Capacity Fit", table_cell_bold), Paragraph("Up to 30 points", table_cell_style), Paragraph("Checks if NGO's daily capacity matches the batch size. Prevents sending 200 meals to a 30-bed shelter or 10 meals to a 500-person camp.", table_cell_style)],
        [Paragraph("Schedule Urgency Window", table_cell_bold), Paragraph("Up to 20 points", table_cell_style), Paragraph("Rewards rapid action for food expiring soon. If deadline is within 3 hours, matching priority escalates.", table_cell_style)],
        [Paragraph("Food Category / Dietary Match", table_cell_bold), Paragraph("Up to 10 points", table_cell_style), Paragraph("Ensures ready-to-eat cooked meals go to immediate dining shelters, while bulk raw produce goes to kitchens with cooking facilities.", table_cell_style)]
    ]
    t_match = Table(match_factors, colWidths=[130, 90, 284])
    t_match.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), accent_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))
    story.append(t_match)
    story.append(Spacer(1, 14))

    # SECTION 5: VOLUNTEER COURIER LIFECYCLE
    story.append(Paragraph("5. Volunteer Logistics & Status Lifecycle", h1_style))
    story.append(Paragraph("Every food donation progresses through an explicit, auditable state machine. Couriers progress the mission using single-click buttons:", body_style))

    lifecycle_data = [
        [Paragraph("Status Code", table_header_style), Paragraph("Meaning & Who Triggers It", table_header_style), Paragraph("What Happens Under the Hood", table_header_style)],
        [Paragraph("AVAILABLE", table_cell_bold), Paragraph("Food posted by donor; visible in the catalog.", table_cell_style), Paragraph("Unreserved inventory. Open for verified NGOs to browse and request.", table_cell_style)],
        [Paragraph("REQUESTED", table_cell_bold), Paragraph("NGO submitted a claim for this food batch.", table_cell_style), Paragraph("Row-level lock holds inventory. Donor receives notification to approve.", table_cell_style)],
        [Paragraph("ACCEPTED", table_cell_bold), Paragraph("Donor approved the NGO reservation request.", table_cell_style), Paragraph("Creates an unassigned pickup task in the volunteer dispatch queue.", table_cell_style)],
        [Paragraph("ASSIGNED", table_cell_bold), Paragraph("Volunteer claims or is assigned to the run.", table_cell_style), Paragraph("Volunteer reviews donor kitchen address, phone, and pickup deadline.", table_cell_style)],
        [Paragraph("PICKED_UP", table_cell_bold), Paragraph("Volunteer collects food from donor kitchen.", table_cell_style), Paragraph("Volunteer enters thermal condition notes; recipient shelter notified food is in transit.", table_cell_style)],
        [Paragraph("COMPLETED", table_cell_bold), Paragraph("Volunteer delivers food safely to recipient shelter.", table_cell_style), Paragraph("Shelter supervisor signs off; impact metrics automatically increment in database.", table_cell_style)],
        [Paragraph("CANCELLED / FLAGGED", table_cell_bold), Paragraph("Cancelled by donor or flagged by admin.", table_cell_style), Paragraph("Removed from active matching; logged in audit ledger with reason.", table_cell_style)]
    ]
    t_life = Table(lifecycle_data, colWidths=[100, 160, 244])
    t_life.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))
    story.append(t_life)
    story.append(Spacer(1, 14))

    # SECTION 6: ADMIN GOVERNANCE & AUDITING
    story.append(Paragraph("6. Administrator Governance & Compliance (`/admin`)", h1_style))
    story.append(Paragraph("The Admin Command Center ensures platform safety, trust, and accountability:", body_style))

    admin_data = [
        [Paragraph("Admin Section / Field", table_header_style), Paragraph("Plain-English Purpose", table_header_style), Paragraph("Action Performed by Auditor", table_header_style)],
        [Paragraph("Accreditation Queue (`/admin/verifications`)", table_cell_bold), Paragraph("Inspect NGO submitted 12A/80G documents or NGO Darpan certificates.", table_cell_style), Paragraph("Click <b>Approve & Verify</b> to unlock food requests for that NGO, or <b>Reject</b> with feedback notes.", table_cell_style)],
        [Paragraph("Safety Incidents (`/admin/safety-reports`)", table_cell_bold), Paragraph("Investigate reports of spoilage, late pickups, or cold chain breaks.", table_cell_style), Paragraph("Assign investigation status (`investigating`, `resolved`, `dismissed`) and flag non-compliant donors.", table_cell_style)],
        [Paragraph("Catalog Moderation (`/admin/listings`)", table_cell_bold), Paragraph("Platform-wide view of all active, completed, and expired listings.", table_cell_style), Paragraph("Cancel or flag listings that violate hygiene regulations or contain prohibited foods.", table_cell_style)],
        [Paragraph("User Accounts (`/admin/users`)", table_cell_bold), Paragraph("Directory of all registered donors, NGOs, and volunteers.", table_cell_style), Paragraph("Toggle active/suspended status to block compromised accounts (admin self-deactivation blocked).", table_cell_style)],
        [Paragraph("Immutable Audit Ledger (`/admin/audit-logs`)", table_cell_bold), Paragraph("Append-only log of every login, status change, verification, and match.", table_cell_style), Paragraph("Inspect timestamp, user email, action name, and JSON details for compliance auditing.", table_cell_style)]
    ]
    t_admin = Table(admin_data, colWidths=[130, 170, 204])
    t_admin.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#be123c")), # Rose / Wine
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))
    story.append(t_admin)
    story.append(Spacer(1, 14))

    # SECTION 7: IMPACT DASHBOARD METRICS
    story.append(Paragraph("7. Impact Dashboard Metrics (`/impact`)", h1_style))
    story.append(Paragraph("All metrics displayed on AnnaSetu AI are computed live using database queries with zero fabricated numbers:", body_style))

    impact_data = [
        [Paragraph("Metric Displayed", table_header_style), Paragraph("Database Calculation Formula", table_header_style), Paragraph("Real-World Sustainable Impact", table_header_style)],
        [Paragraph("Total Servings Redistributed", table_cell_bold), Paragraph("SUM(estimated_servings) for listings with status = 'COMPLETED'", table_cell_style), Paragraph("Directly advances <b>SDG 2 (Zero Hunger)</b> by tracking individual plates provided to vulnerable citizens.", table_cell_style)],
        [Paragraph("Quantity Diverted (kg)", table_cell_bold), Paragraph("SUM(quantity) converted to kg for completed donations", table_cell_style), Paragraph("Advances <b>SDG 12</b> by measuring edible organic matter prevented from rotting in municipal landfills.", table_cell_style)],
        [Paragraph("Pickup Completion Rate (%)", table_cell_bold), Paragraph("(Completed Pickups / Total Created Pickups) * 100", table_cell_style), Paragraph("Measures volunteer dispatch reliability and logistical effectiveness across the city.", table_cell_style)],
        [Paragraph("Category Breakdown", table_cell_bold), Paragraph("Grouped counts by Prepared Meals, Bakery, Produce, Packaged Food", table_cell_style), Paragraph("Reveals whether surplus is primarily ready-to-eat banquets or fresh raw market surplus.", table_cell_style)]
    ]
    t_impact = Table(impact_data, colWidths=[130, 170, 204])
    t_impact.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light])
    ]))
    story.append(t_impact)
    story.append(Spacer(1, 14))

    # SECTION 8: AI ASSISTANT WIDGET
    story.append(Paragraph("8. AnnaSetu AI Assistant Floating Widget", h1_style))
    story.append(Paragraph("Located at the bottom-right corner of every page, the AI Assistant provides interactive, role-scoped guidance:", body_style))
    story.append(Paragraph("• <b>Role-Scoped Answers:</b> A donor asking about their listings gets kitchen-specific advice; an NGO asking about eligibility receives step-by-step accreditation instructions.<br/>"
                           "• <b>Natural Language Search:</b> Converts phrases like <i>'Need 50 vegetarian meals for dinner in Indiranagar'</i> into structured database filters.<br/>"
                           "• <b>Resilient Fallback:</b> If Gemini API quota or network connectivity is unavailable, the assistant continues functioning using high-accuracy deterministic rule matching.", body_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully built: {filename}")

if __name__ == "__main__":
    build_pdf()
