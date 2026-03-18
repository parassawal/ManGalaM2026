import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

events = [
    {"id": "escaperoom", "title": "Escape Room"},
    {"id": "hackathon", "title": "Hackathon"},
    {"id": "posterpaper", "title": "Poster & Paper"},
    {"id": "drone", "title": "Drone"},
    {"id": "snakeladder", "title": "Snake & Ladder"},
    {"id": "3d", "title": "3D"},
    {"id": "iot", "title": "IoT"},
    {"id": "bgmi", "title": "BGMI"},
    {"id": "techyudh", "title": "Tech Yudh"},
    {"id": "racing", "title": "Racing"},
    {"id": "mun", "title": "MUN"},
    {"id": "parliament", "title": "Parliament"}
]

for evt in events:
    title = evt["title"]
    btn_html = f'''                    </div>
                    <a href="{evt['id']}.html" class="event-btn">
                        View Details <i data-lucide="arrow-right" style="width: 18px; height: 18px;"></i>
                    </a>
                </div>'''
    
    # regex to find the closing tags of the team-list and replace with btn_html
    # We look for the h3 with event-title, then the next </div>\n                </div> before the next event-card
    # Actually, simpler: replace `</ul>\n                    </div>\n                </div>\n\n                <!-- {number}. `
    
    # Or just replace `</ul>\n                    </div>\n                </div>` but only for the specific event block.
    
    pattern = rf'(<h3 class="event-title">{re.escape(title)}</h3>.*?</ul>\n                    </div>)\n                </div>'
    replacement = rf'\1\n                    <a href="{evt["id"]}.html" class="event-btn">\n                        View Details <i data-lucide="arrow-right" style="width: 18px; height: 18px;"></i>\n                    </a>\n                </div>'
    
    html = re.sub(pattern, replacement, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
