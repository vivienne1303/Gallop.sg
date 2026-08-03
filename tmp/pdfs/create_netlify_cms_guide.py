from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, KeepTogether, Image
)

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "pdf" / "Gallop-SG-Netlify-Editing-Guide.pdf"
LOGO = ROOT / "images" / "logo.png"
OUT.parent.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = A4
GREEN = colors.HexColor("#0C473D")
TEAL = colors.HexColor("#1599A6")
RED = colors.HexColor("#B4161B")
INK = colors.HexColor("#24313A")
MUTED = colors.HexColor("#66717D")
PALE = colors.HexColor("#EAF5F3")
LIGHT = colors.HexColor("#F4F6F7")
LINE = colors.HexColor("#D8DEE2")
WHITE = colors.white

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="GuideTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=28, leading=32, textColor=GREEN, spaceAfter=8))
styles.add(ParagraphStyle(name="SubTitle", parent=styles["Normal"], fontSize=13, leading=18, textColor=MUTED))
styles.add(ParagraphStyle(name="H1x", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=GREEN, spaceAfter=10))
styles.add(ParagraphStyle(name="H2x", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=13.5, leading=17, textColor=INK, spaceBefore=8, spaceAfter=5))
styles.add(ParagraphStyle(name="Bodyx", parent=styles["BodyText"], fontSize=10.3, leading=15, textColor=INK, spaceAfter=6))
styles.add(ParagraphStyle(name="Smallx", parent=styles["BodyText"], fontSize=8.3, leading=11.5, textColor=MUTED))
styles.add(ParagraphStyle(name="StepNo", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=16, leading=18, textColor=WHITE, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="CardTitle", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=GREEN))
styles.add(ParagraphStyle(name="Callout", parent=styles["BodyText"], fontSize=9.5, leading=14, textColor=INK))
styles.add(ParagraphStyle(name="CenterSmall", parent=styles["Smallx"], alignment=TA_CENTER))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(18*mm, 13*mm, PAGE_W-18*mm, 13*mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(18*mm, 8.5*mm, "Gallop SG - Netlify website editing guide")
    canvas.drawRightString(PAGE_W-18*mm, 8.5*mm, f"Page {doc.page}")
    canvas.restoreState()

def pill(text, bg=GREEN, fg=WHITE):
    t = Table([[Paragraph(text, ParagraphStyle(name="pill", parent=styles["Smallx"], fontName="Helvetica-Bold", textColor=fg, alignment=TA_CENTER))]], colWidths=[32*mm])
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),bg),("BOX",(0,0),(-1,-1),0,bg),("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),5),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]))
    return t

def callout(title, text, color=TEAL):
    data = [[Paragraph(title, styles["CardTitle"]), Paragraph(text, styles["Callout"])]]
    t = Table(data, colWidths=[35*mm, 127*mm])
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),PALE),("BOX",(0,0),(-1,-1),0.8,color),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),9),("RIGHTPADDING",(0,0),(-1,-1),9),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
    return t

def step(n, title, body):
    text = [Paragraph(title, styles["CardTitle"]), Paragraph(body, styles["Bodyx"])]
    t = Table([[Paragraph(str(n), styles["StepNo"]), text]], colWidths=[10*mm, 152*mm])
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(0,0),GREEN),("VALIGN",(0,0),(0,0),"MIDDLE"),("VALIGN",(1,0),(1,0),"TOP"),("LEFTPADDING",(0,0),(0,0),0),("RIGHTPADDING",(0,0),(0,0),0),("TOPPADDING",(0,0),(0,0),4),("BOTTOMPADDING",(0,0),(0,0),4),("LEFTPADDING",(1,0),(1,0),5*mm),("RIGHTPADDING",(1,0),(1,0),4),("TOPPADDING",(1,0),(1,0),2),("BOTTOMPADDING",(1,0),(1,0),5)]))
    return t

def ui_box(title, rows, note=None):
    content = [[Paragraph(title, ParagraphStyle(name="uit", parent=styles["Smallx"], fontName="Helvetica-Bold", textColor=INK))]]
    for label, value in rows:
        content.append([Table([[Paragraph(label.upper(), styles["Smallx"])],[Paragraph(value, styles["Bodyx"])]], colWidths=[150*mm])])
    if note:
        content.append([Paragraph(note, styles["Smallx"])])
    t = Table(content, colWidths=[162*mm])
    cmds=[("BACKGROUND",(0,0),(-1,0),colors.HexColor("#E1E4E7")),("BOX",(0,0),(-1,-1),0.7,LINE),("INNERGRID",(0,1),(-1,-2),0.4,LINE),("LEFTPADDING",(0,0),(-1,-1),9),("RIGHTPADDING",(0,0),(-1,-1),9),("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7)]
    t.setStyle(TableStyle(cmds))
    return t

doc = BaseDocTemplate(str(OUT), pagesize=A4, rightMargin=18*mm, leftMargin=18*mm, topMargin=18*mm, bottomMargin=18*mm, title="Gallop SG Netlify Website Editing Guide", author="Gallop SG")
frame = Frame(doc.leftMargin, doc.bottomMargin+3*mm, doc.width, doc.height-3*mm, id="normal")
doc.addPageTemplates(PageTemplate(id="guide", frames=frame, onPage=footer))
S=[]

# Cover
if LOGO.exists():
    S += [Spacer(1, 17*mm), Image(str(LOGO), width=105*mm, height=28*mm), Spacer(1, 16*mm)]
S += [Paragraph("Edit the Gallop SG website", styles["GuideTitle"]), Paragraph("A practical staff guide for changing text, hero pictures and picture galleries through the Netlify admin page.", styles["SubTitle"]), Spacer(1, 12*mm), pill("STAFF GUIDE"), Spacer(1, 18*mm)]
S += [callout("Admin address", "<b>https://gallopsg.netlify.app/admin/</b><br/>Sign in using the email address invited through Netlify Identity."), Spacer(1, 9*mm)]
S += [Paragraph("What this guide covers", styles["H2x"])]
cards=[("Text", "Edit headings, introductions, story paragraphs, FAQs and contact details."),("Hero pictures", "Replace the large picture at the top of a selected website page."),("Galleries", "Add, delete and drag pictures into the order you want."),("Publish", "Save the change and check it on the live website.")]
tbl=Table([[Paragraph(f"<b>{a}</b><br/>{b}", styles["Callout"]) for a,b in cards[:2]],[Paragraph(f"<b>{a}</b><br/>{b}", styles["Callout"]) for a,b in cards[2:]]], colWidths=[81*mm,81*mm])
tbl.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),LIGHT),("BOX",(0,0),(-1,-1),0.6,LINE),("INNERGRID",(0,0),(-1,-1),0.6,LINE),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),10),("BOTTOMPADDING",(0,0),(-1,-1),10)]))
S += [tbl, Spacer(1, 14*mm), Paragraph("Prepared for Gallop SG staff | August 2026", styles["Smallx"]), PageBreak()]

# Start
S += [Paragraph("1. Open the editor", styles["H1x"]), step(1,"Sign in","Open the admin address above. Enter your invited email address and password."), step(2,"Open the website record","Choose <b>Website Content</b>, then <b>Gallop SG Website</b>. This opens the long editing form shown in your screenshot."), step(3,"Expand the section you need","Select the arrow beside a grey section heading. You do not need to edit every section."), Spacer(1,5*mm)]
S += [ui_box("WEBSITE CONTENT", [("ABOUT US", "Heading, introduction, story heading and story paragraphs"),("PAGE TEXT AND HERO PICTURES", "Page headings, introductions and large hero images"),("PICTURE GALLERIES", "Gallery page, gallery number and ordered pictures")], "A down arrow means the section is open. A right arrow means it is collapsed."), Spacer(1,8*mm)]
S += [callout("Before editing", "Keep the live page open in another browser tab. This makes it easy to compare the old and new content after publishing."), PageBreak()]

# text
S += [Paragraph("2. Edit and arrange text", styles["H1x"]), Paragraph("Use <b>About Us</b> for the main company story. Use <b>Page Text and Hero Pictures</b> for a specific page. Other sections such as FAQs, Locations and Riding Lesson Prices work in the same list style.", styles["Bodyx"])]
S += [step(1,"Open the correct section","Click the grey section heading to expand it."), step(2,"Click inside a field","Replace only the words you want to change. Check spelling, phone numbers and prices carefully."), step(3,"Arrange list items","For story paragraphs, FAQs, prices and similar lists, hold the <b>= drag handle</b> in the middle of an item and drag it up or down."), step(4,"Add or remove","Use <b>Add...</b> to create a new item. Use the <b>X</b> at the right of an item to remove it."), Spacer(1,4*mm)]
S += [ui_box("STORY PARAGRAPHS", [("=  Paragraph 1", "Drag this card to change which paragraph appears first."),("=  Paragraph 2", "Click the arrow to open and edit the paragraph."),("X", "Removes that item. Use carefully.")], "The order shown here is the order used on the website."), Spacer(1,8*mm), callout("Important", "Do not use the X unless you really want to delete an item. If you make a mistake, leave the page before publishing and reopen the record."), PageBreak()]

# hero
S += [Paragraph("3. Change page text or a hero picture", styles["H1x"]), Paragraph("A hero picture is the large image at the top of a page.", styles["Bodyx"]), step(1,"Open Page Text and Hero Pictures","Find the card for the website page you want. If needed, use <b>Add Page</b> and select the page only once."), step(2,"Confirm Website Page","Check the page name before changing anything. For example: Home, Riding Lessons, Gallop CARES or Birthday Party."), step(3,"Edit text","Update Small Heading, Main Heading or Introduction. Empty optional fields leave the existing page content unchanged."), step(4,"Choose the picture","Under Hero Picture, select or upload an image. The website automatically crops it to the existing hero shape."), step(5,"Describe the picture","Enter a short Hero Picture Description, such as <i>Child riding a brown pony with an instructor</i>."), Spacer(1,5*mm)]
S += [ui_box("PAGE TEXT AND HERO PICTURES", [("Website Page", "Riding Lessons"),("Main Heading", "Horse riding lessons for every level"),("Introduction", "Short, clear introduction shown near the top of the page."),("Hero Picture", "Choose an existing image or upload a new one"),("Hero Picture Description", "Describe what is visible, not the file name")]), Spacer(1,7*mm), callout("Picture tip", "Use a clear, high-resolution landscape picture. Keep people and horses near the centre because the sides may be cropped on smaller screens."), PageBreak()]

# gallery
S += [Paragraph("4. Add and arrange gallery pictures", styles["H1x"]), step(1,"Open Picture Galleries","Expand the section near the bottom of the form."), step(2,"Open or create the gallery","Use an existing gallery card, or choose <b>Add Gallery</b> if the page has never had a managed gallery."), step(3,"Select the page","Choose the correct Website Page. Leave Gallery Number as <b>1</b> unless that page has a second separate gallery."), step(4,"Add pictures","Choose <b>Add Picture</b>. Upload or select the image, then write a short Picture Description."), step(5,"Reorder pictures","Hold the <b>= drag handle</b> on a picture card and drag it up or down. Top item = first picture on the website."), step(6,"Delete a picture","Use the <b>X</b> on that picture card. Do not delete the whole gallery record unless you intend to restore the pictures originally written into the page."), Spacer(1,4*mm)]
S += [ui_box("PICTURES - DISPLAY ORDER", [("1   =  Riding lesson", "First picture shown"),("2   =  Pony feeding", "Second picture shown"),("3   =  Birthday party", "Third picture shown")], "Portrait and landscape uploads are automatically cropped into the website's fixed gallery cards."), Spacer(1,7*mm), callout("Empty gallery", "Removing every picture hides that managed gallery from the website. You can add pictures again later."), PageBreak()]

# publish
S += [Paragraph("5. Save, publish and check", styles["H1x"]), step(1,"Wait for Changes saved","After editing, wait until the top-left status confirms that your changes have been saved."), step(2,"Publish the change","Use the publishing control at the top of the editor if it appears. When the status reads <b>Published</b>, the CMS has sent the update."), step(3,"Allow time for deployment","The website update is committed and redeployed. It may not appear instantly."), step(4,"Check the live page","Open the exact page you edited and refresh it. Check desktop and mobile widths if possible."), step(5,"Check the essentials","Confirm picture order, cropping, spelling, links, phone numbers and prices."), Spacer(1,7*mm)]
check_rows=[["CHECK", "WHAT TO LOOK FOR"],["Text", "Correct wording, punctuation and paragraph order"],["Pictures", "Correct image, order, crop and description"],["Page", "You edited the intended page, not a similar page"],["Status", "The admin record shows Published"],["Live site", "Refresh and confirm the change is visible"]]
ct=Table(check_rows, colWidths=[38*mm,124*mm])
ct.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),GREEN),("TEXTCOLOR",(0,0),(-1,0),WHITE),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("BACKGROUND",(0,1),(-1,-1),LIGHT),("BOX",(0,0),(-1,-1),0.6,LINE),("INNERGRID",(0,0),(-1,-1),0.5,LINE),("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),("FONTNAME",(1,1),(-1,-1),"Helvetica"),("FONTSIZE",(0,0),(-1,-1),9),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),8),("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7)]))
S += [ct, Spacer(1,8*mm), callout("If the old version remains", "Wait a few minutes, then use a hard refresh (Ctrl+F5 on Windows). If it still does not update, check the latest Netlify deployment before editing the content again."), PageBreak()]

# reference
S += [Paragraph("Quick reference", styles["H1x"])]
refs=[["CONTROL", "MEANING"],["Arrow > / v", "Collapse or expand a section or item"],["= handle", "Drag an item to change its display order"],["Add... +", "Add a paragraph, FAQ, price row, page, gallery or picture"],["X", "Remove that individual item"],["Choose an image", "Select an existing upload or upload a new file"],["Changes saved", "The editor has saved the current form state"],["Published", "The content is in the published CMS state"]]
rt=Table(refs, colWidths=[43*mm,119*mm])
rt.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),GREEN),("TEXTCOLOR",(0,0),(-1,0),WHITE),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,LIGHT]),("BOX",(0,0),(-1,-1),0.7,LINE),("INNERGRID",(0,0),(-1,-1),0.4,LINE),("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),("FONTNAME",(1,1),(-1,-1),"Helvetica"),("FONTSIZE",(0,0),(-1,-1),9),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),8),("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7)]))
S += [rt, Spacer(1,10*mm), Paragraph("Safe editing checklist", styles["H2x"]), Paragraph("1. Confirm the page or section. &nbsp;&nbsp; 2. Make one logical change at a time. &nbsp;&nbsp; 3. Check descriptions for uploaded pictures. &nbsp;&nbsp; 4. Wait for saved/published status. &nbsp;&nbsp; 5. Refresh and inspect the live page.", styles["Bodyx"]), Spacer(1,9*mm), callout("Need access?", "A Netlify administrator must invite the staff member under <b>Integrations > Identity > Users</b>. Public registration should remain invite-only.", RED)]

doc.build(S)
print(OUT)
