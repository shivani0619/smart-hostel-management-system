import os
import re

student_pages = [
    'student-dashboard.html',
    'student-profile.html',
    'room-details.html',
    'attendance.html',
    'entry-exit.html',
    'leave-request.html',
    'visitors.html',
    'fees.html',
    'complaints.html',
    'emergency.html',
    'notification.html',
    'settings.html',
    'mess.html'
]

# Read the master sidebar template
with open('master_sidebar.txt', 'r', encoding='utf-8') as f:
    master_sidebar = f.read()

for page in student_pages:
    if not os.path.exists(page):
        print(f"Skipping {page} (not found)")
        continue

    with open(page, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the existing sidebar
    # It might be <aside ...>...</aside> or <div class="sidebar">...</div>
    # Usually it's the block between <!-- ================= SIDEBAR ================= --> and <!-- ================= MAIN CONTENT ================= -->
    # Or we can just look for the first <aside ...>...</aside>
    
    # Try finding <aside ...> ... </aside>
    aside_match = re.search(r'<aside[^>]*class=[\'"][^\'"]*sidebar[^\'"]*[\'"][^>]*>.*?</aside>', content, re.DOTALL)
    
    if not aside_match:
        # Try nav
        aside_match = re.search(r'<nav[^>]*class=[\'"][^\'"]*side-nav[^\'"]*[\'"][^>]*>.*?</nav>', content, re.DOTALL)
        
    if not aside_match:
        print(f"WARNING: Could not find sidebar block in {page}")
        continue
        
    # Prepare the new sidebar for this page
    new_sidebar = master_sidebar
    
    # Add active class for the specific page
    # Look for href="page"
    target_href = f'href="{page}"'
    idx = new_sidebar.find(target_href)
    if idx != -1:
        # Find the class="nav-item" preceding this href
        # actually in our HTML it's <a href="..." class="nav-item">
        class_idx = new_sidebar.find('class="nav-item"', idx)
        if class_idx != -1 and class_idx - idx < 100:
            new_sidebar = new_sidebar[:class_idx] + 'class="nav-item active"' + new_sidebar[class_idx + len('class="nav-item"'):]
        else:
            # Maybe class is before href
            # Just do a generic replace in the anchor tag block
            # This requires regex
            pass
            
    # Better approach for active class:
    # Use regex to find the anchor tag with this href and replace its class
    def add_active(match):
        a_tag = match.group(0)
        return a_tag.replace('class="nav-item"', 'class="nav-item active"')
        
    new_sidebar = re.sub(r'<a[^>]*href="' + re.escape(page) + r'"[^>]*>', add_active, new_sidebar)

    # Replace the old sidebar with the new one
    content = content[:aside_match.start()] + new_sidebar + content[aside_match.end():]
    
    # Ensure student-sidebar.css is linked
    if 'student-sidebar.css' not in content:
        head_end = content.find('</head>')
        if head_end != -1:
            link_tag = '\n    <!-- Global Sidebar CSS -->\n    <link rel="stylesheet" href="student-sidebar.css">\n'
            content = content[:head_end] + link_tag + content[head_end:]

    with open(page, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Successfully synchronized sidebar in {page}")

