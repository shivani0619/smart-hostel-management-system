import os

with open('student-dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

start_tag = '<aside class="sidebar"'
end_tag = '</aside>'

start_idx = content.find(start_tag)
if start_idx != -1:
    end_idx = content.find(end_tag, start_idx) + len(end_tag)
    sidebar_html = content[start_idx:end_idx]
    
    sidebar_html = sidebar_html.replace('class="nav-item active"', 'class="nav-item"')
    
    with open('master_sidebar.txt', 'w', encoding='utf-8') as f:
        f.write(sidebar_html)
    print('Master sidebar extracted successfully.')
else:
    print('Failed to extract master sidebar.')
