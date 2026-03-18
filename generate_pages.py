import os
import re

events = [
    {"id": "escaperoom", "name": "Escape Room"},
    {"id": "hackathon", "name": "Hackathon"},
    {"id": "posterpaper", "name": "Poster & Paper"},
    {"id": "drone", "name": "Drone"},
    {"id": "snakeladder", "name": "Snake & Ladder"},
    {"id": "3d", "name": "3D"},
    {"id": "iot", "name": "IoT"},
    {"id": "bgmi", "name": "BGMI"},
    {"id": "techyudh", "name": "Tech Yudh"},
    {"id": "racing", "name": "Racing"},
    {"id": "mun", "name": "MUN"},
    {"id": "parliament", "name": "Parliament"}
]

with open('sharktank.html', 'r', encoding='utf-8') as f:
    intro_template = f.read()

with open('register.html', 'r', encoding='utf-8') as f:
    register_template = f.read()

for evt in events:
    # Generate Intro Page
    intro_content = intro_template.replace('Shark Tank', evt['name']).replace('SHARK TANK', evt['name'].upper())
    # Specific fix to link back correctly 
    intro_content = intro_content.replace('href="register.html"', f'href="{evt["id"]}-register.html"')
    
    # Generic placeholder text for Intro
    intro_content = re.sub(r'The Shark Tank Event at Mangalam 2026 is a premier platform.*?(?=</p>)', 
                           f'The {evt["name"]} at Mangalam 2026 is an amazing opportunity for students to showcase their skills.', 
                           intro_content, flags=re.DOTALL)
                           
    intro_content = intro_content.replace('Startup Pitch Competition', evt['name'] + ' Competition')
    
    with open(f'{evt["id"]}.html', 'w', encoding='utf-8') as f:
        f.write(intro_content)
        
    # Generate Registration Page
    reg_content = register_template.replace('Shark Tank', evt['name']).replace('SHARK TANK', evt['name'].upper())
    
    with open(f'{evt["id"]}-register.html', 'w', encoding='utf-8') as f:
        f.write(reg_content)

print("Generated 24 pages successfully.")
