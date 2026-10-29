import os
import re

files_to_update = [
    'student-dashboard.html', 'student-profile.html', 'room-details.html',
    'attendance.html', 'entry-exit.html', 'fees.html', 'visitors.html',
    'leave-request.html', 'complaints.html', 'emergency.html',
    'notification.html', 'settings.html', 'mess.html'
]

with open('sidebar-snippet.txt', 'r', encoding='utf-8') as f:
    sidebar_html = f.read()

for filename in files_to_update:
    if not os.path.exists(filename):
        continue
        
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the sidebar to replace
    # We look for <aside class="sidebar"... and the closing </aside>
    aside_start = content.find('<aside class="sidebar"')
    if aside_start != -1:
        aside_end = content.find('</aside>', aside_start)
        if aside_end != -1:
            aside_end += len('</aside>')
            
            # Prepare new sidebar for this specific file
            new_sidebar = sidebar_html
            
            # Remove active from dashboard
            new_sidebar = new_sidebar.replace('class="nav-item active"', 'class="nav-item"')
            
            # Add active to the current page's link
            # We want to replace class="nav-item" with class="nav-item active" on the target link
            
            # Look for href="filename"
            target_href = 'href="' + filename + '"'
            # Simple approach: find the href, then find the nearest class="nav-item" and make it active
            idx = new_sidebar.find(target_href)
            if idx != -1:
                class_idx = new_sidebar.find('class="nav-item"', idx)
                if class_idx != -1 and class_idx - idx < 100:
                    new_sidebar = new_sidebar[:class_idx] + 'class="nav-item active"' + new_sidebar[class_idx + len('class="nav-item"'):]
            
            content = content[:aside_start] + new_sidebar + content[aside_end:]
            
    # Also add the stylesheet link
    if 'href="student-sidebar.css"' not in content:
        # Find </head>
        head_end = content.find('</head>')
        if head_end != -1:
            css_link = '    <!-- Global Sidebar CSS -->\n    <link rel="stylesheet" href="student-sidebar.css">\n'
            content = content[:head_end] + css_link + content[head_end:]

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

print('Updated HTML files.')
