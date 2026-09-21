import re

with open("/Users/apple/Downloads/Module Page/code.html", "r") as f:
    html = f.read()

# Replace class= with className=
jsx = html.replace('class="', 'className="')

# Replace for= with htmlFor=
jsx = jsx.replace('for="', 'htmlFor="')

# Remove inline scripts
jsx = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', jsx, flags=re.IGNORECASE)

# Close void tags (input, img, br, hr)
for tag in ['input', 'img', 'br', 'hr']:
    # simple regex to close unclosed tags
    jsx = re.sub(rf'<{tag}([^>]*[^/])>', rf'<{tag}\1 />', jsx)

# Remove HTML, Head, Body, Header, Main, etc.
# Extract the content inside <main class="w-full pt-header-height bg-surface min-h-[calc(100vh-4rem)] flex flex-col"> ... </main>
# We will just extract <div class="w-full max-w-[1520px] ..."> ... </div> (the child of main)

main_match = re.search(r'<div className="w-full max-w-\[1520px\][^>]*>([\s\S]*?)<script>', jsx)
if main_match:
    content = '<div className="w-full max-w-[1520px]' + main_match.group(1).rsplit('</div>', 1)[0]
    
    # We might need to handle SVG/Image alt tags or inline styles
    content = content.replace('style="background-image: url(', "style={{ backgroundImage: 'url(")
    content = content.replace(")')\">", ")' }} >")
    
    # Wrap in component
    output = f"""'use client';
import React, { { useState } } from 'react';
import Link from 'next/link';

export default function ModuleUploadPage() {{
  const [activeTab, setActiveTab] = useState('direct');
  const [activeTier, setActiveTier] = useState('2');

  return (
    <div className="w-full bg-surface min-h-screen flex flex-col p-4 lg:p-8">
      {content}
    </div>
  );
}}
"""
    # ensure input tags are closed properly
    output = output.replace('type="text" value="45 Minutes 20 Seconds">', 'type="text" defaultValue="45 Minutes 20 Seconds" />')
    output = output.replace('type="text" value="Episode 05: Internal vs External Liquidity Pools &amp; Time-Price Displacement">', 'type="text" defaultValue="Episode 05: Internal vs External Liquidity Pools & Time-Price Displacement" />')
    output = output.replace('type="text" value="https://www.tradingview.com/chart/EURUSD/hw-assignment-liquidity-pool-markup-ep5">', 'type="text" defaultValue="https://www.tradingview.com/chart/EURUSD/hw-assignment-liquidity-pool-markup-ep5" />')
    output = output.replace('type="checkbox">', 'type="checkbox" />')
    output = output.replace('selected="">', 'defaultValue="Module 02">')
    output = output.replace('data-alt=', 'alt=')

    import os
    os.makedirs('src/app/admin-trading/courses/module', exist_ok=True)
    with open('src/app/admin-trading/courses/module/page.tsx', 'w') as out:
        out.write(output)
    print("Parsed successfully!")
else:
    print("Could not extract main content.")
