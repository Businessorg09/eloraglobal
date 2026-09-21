import re

with open("/Users/apple/Downloads/Module Page/code.html", "r") as f:
    html = f.read()

# Replace class= with className=
jsx = html.replace('class="', 'className="')
jsx = jsx.replace('for="', 'htmlFor="')

# Close tags
for tag in ['input', 'img', 'br', 'hr']:
    jsx = re.sub(rf'<{tag}([^>]*[^/])>', rf'<{tag}\1 />', jsx)

main_start = jsx.find('<main')
main_content = jsx[main_start:]
main_end = main_content.find('</main>')
main_content = main_content[:main_end]

# Extract the inner div
first_div = main_content.find('<div className="w-full max-w-[1520px]')
if first_div != -1:
    content = main_content[first_div:]
    # Fix inline styles
    content = content.replace('style="background-image: url(', "style={{ backgroundImage: 'url(")
    content = content.replace(")')\">", ")' }} >")
    
    # Fix inputs
    content = content.replace('type="text" value=', 'type="text" defaultValue=')
    content = content.replace('type="checkbox">', 'type="checkbox" />')
    content = content.replace('selected="">', 'defaultValue="Module 02">')
    content = content.replace('data-alt=', 'alt=')
    content = content.replace('<!--', '{/*')
    content = content.replace('-->', '*/}')
    
    output = f"""'use client';
import React, { { useState } } from 'react';
import Link from 'next/link';

export default function ModuleUploadPage() {{
  const [activeTab, setActiveTab] = useState('direct');
  const [activeTier, setActiveTier] = useState('2');

  return (
    <div className="w-full bg-surface flex flex-col p-4 lg:p-8">
      {content}
    </div>
  );
}}
"""
    import os
    os.makedirs('src/app/admin-trading/courses/module', exist_ok=True)
    with open('src/app/admin-trading/courses/module/page.tsx', 'w') as out:
        out.write(output)
    print("Parsed successfully!")
else:
    print("Failed to find div")
