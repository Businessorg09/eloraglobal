import re
import os

with open("/Users/apple/Downloads/Module Page/code.html", "r") as f:
    html = f.read()

jsx = html.replace('class="', 'className="').replace('for="', 'htmlFor="')

for tag in ['input', 'img', 'br', 'hr']:
    jsx = re.sub(rf'<{tag}([^>]*[^/])>', rf'<{tag}\1 />', jsx)

main_start = jsx.find('<main')
main_content = jsx[main_start:]
main_end = main_content.find('</main>')
main_content = main_content[:main_end]

first_div = main_content.find('<div className="w-full max-w-[1520px]')
if first_div != -1:
    content = main_content[first_div:]
    content = content.replace('style="background-image: url(', "style={{ backgroundImage: 'url(")
    content = content.replace(")')\">", ")' }} >")
    content = content.replace('type="text" value=', 'type="text" defaultValue=')
    content = content.replace('type="checkbox">', 'type="checkbox" />')
    content = content.replace('selected="">', 'defaultValue="Module 02">')
    content = content.replace('data-alt=', 'alt=')
    content = content.replace('<!--', '{/*')
    content = content.replace('-->', '*/}')
    
    output = f"""'use client';
import React, {{ useState }} from 'react';
import Link from 'next/link';

export default function ModuleUploadPage() {{
  const [activeTab, setActiveTab] = useState('direct');
  const [activeTier, setActiveTier] = useState('2');

  return (
    <div className="w-full bg-surface flex flex-col">
      {content}
    </div>
  );
}}
"""
    os.makedirs('src/app/admin-trading/courses/module', exist_ok=True)
    with open('src/app/admin-trading/courses/module/page.tsx', 'w') as out:
        out.write(output)
    print("Parsed successfully!")
else:
    print("Failed to find div")
