import os
import glob
import re

svg_dir = 'frontend/public/svgl'
output_path = 'frontend/src/components/ui/svgl-icons.tsx'

attr_map = {
    'fill-rule': 'fillRule',
    'clip-rule': 'clipRule',
    'stroke-width': 'strokeWidth',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'stroke-miterlimit': 'strokeMiterlimit',
    'fill-opacity': 'fillOpacity',
    'stroke-opacity': 'strokeOpacity',
    'stop-color': 'stopColor',
    'stop-opacity': 'stopOpacity',
    'clip-path': 'clipPath',
    'xml:space': 'xmlSpace',
    'xmlns:xlink': 'xmlnsXlink',
    'xlink:href': 'xlinkHref',
    'class=': 'className=',
}

def convert_style_to_attributes(match):
    style_str = match.group(1)
    # e.g. fill:#0866ff;fillOpacity:1;fillRule:nonzero;stroke:none
    parts = [p.strip() for p in style_str.split(';') if p.strip()]
    attrs = []
    for p in parts:
        if ':' in p:
            k, v = p.split(':', 1)
            k = k.strip()
            v = v.strip()
            # Convert kebab to camelCase if needed
            k = attr_map.get(k, k)
            attrs.append(f'{k}="{v}"')
    return ' '.join(attrs)

def clean_svg_string(svg_text):
    # Match svg opening
    open_match = re.search(r'<svg([^>]*)>(.*)</svg>', svg_text, flags=re.DOTALL)
    if not open_match:
        return '0 0 24 24', '', ''
    
    attrs_str = open_match.group(1)
    inner = open_match.group(2).strip()
    
    vb_match = re.search(r'viewBox=["\']([^"\']+)["\']', attrs_str)
    view_box = vb_match.group(1) if vb_match else "0 0 24 24"
    
    fill_match = re.search(r'fill=["\']([^"\']+)["\']', attrs_str)
    default_fill = fill_match.group(1) if fill_match else None
    
    for old, new in attr_map.items():
        inner = inner.replace(old, new)
        
    # Convert style="..." to SVG presentation attributes
    inner = re.sub(r'style=["\']([^"\']+)["\']', convert_style_to_attributes, inner)
        
    return view_box, default_fill, inner

icons = {}
for f in sorted(glob.glob(f'{svg_dir}/*.svg')):
    name = os.path.basename(f).replace('.svg', '')
    with open(f, 'r', encoding='utf-8') as fh:
        icons[name] = clean_svg_string(fh.read())

print(f"Loaded {len(icons)} SVGs.")

header = '''"use client";

/**
 * SVGL (https://svgl.app/) - Beautiful SVG Icons & Brand Logos Collection
 * High-performance, zero-latency vector React SVG components.
 */
import * as React from "react";

export interface SvglIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  title?: string;
}
'''

components = []

name_to_comp = {
    'whatsapp': 'SvglWhatsapp',
    'telegram': 'SvglTelegram',
    'instagram': 'SvglInstagram',
    'facebook': 'SvglFacebook',
    'messenger': 'SvglMessenger',
    'x': 'SvglX',
    'twitter': 'SvglTwitter',
    'google': 'SvglGoogle',
    'gmail': 'SvglGmail',
    'github': 'SvglGithub',
    'apple': 'SvglApple',
    'paypal': 'SvglPaypal',
    'stripe': 'SvglStripe',
    'twilio': 'SvglTwilio',
    'youtube': 'SvglYoutube',
    'linkedin': 'SvglLinkedin',
    'discord': 'SvglDiscord',
    'nextjs': 'SvglNextjs',
    'react': 'SvglReact',
    'tailwindcss': 'SvglTailwindcss',
    'python': 'SvglPython',
    'fastapi': 'SvglFastapi',
    'sqlite': 'SvglSqlite',
    'vercel': 'SvglVercel',
}

for name, (view_box, default_fill, inner) in icons.items():
    comp_name = name_to_comp.get(name, f"Svgl{name.capitalize()}")
    fill_attr = f'fill="{default_fill}"' if default_fill else 'fill="currentColor"'
    
    comp_code = f'''export function {comp_name}({{ size = 20, className, ...props }}: SvglIconProps) {{
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="{view_box}"
      width={{size}}
      height={{size}}
      {fill_attr}
      className={{className}}
      {{...props}}
    >
      {inner}
    </svg>
  );
}}'''
    components.append(comp_code)

# Add custom Indian UPI PG vectors (UPI, PhonePe, GPay, Paytm, BHIM, RuPay)
indian_payment_icons = '''
/** Official NPCI UPI Vector Logo */
export function SvglUpi({ size = 20, className, ...props }: SvglIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 32"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <path d="M12 4 L26 16 L12 28 Z" fill="#097939" />
      <path d="M22 4 L36 16 L22 28 Z" fill="#ED752E" />
      <text x="42" y="23" fontFamily="sans-serif" fontSize="21" fontWeight="900" fontStyle="italic" fill="#000000">
        UPI
      </text>
    </svg>
  );
}

/** Official PhonePe Vector Logo */
export function SvglPhonePe({ size = 20, className, ...props }: SvglIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <circle cx="24" cy="24" r="23" fill="#5f259f" />
      <path
        d="M23.8 11.2h4.5c2.3 0 4.1.7 5.2 2 1.1 1.3 1.6 3.1 1.6 5.5 0 2.4-.6 4.3-1.8 5.7-1.2 1.4-3.1 2.1-5.7 2.1h-3.8v10.3h-4.8V11.2h4.8zm0 11.3h3.6c1.1 0 1.9-.3 2.5-.9.6-.6.9-1.5.9-2.7 0-1.2-.3-2.1-.9-2.7-.6-.6-1.5-.9-2.6-.9h-3.5v7.2z"
        fill="#ffffff"
      />
      <path
        d="M17.5 16.5h3.8v13.8c0 2.2-.5 3.9-1.5 5.1-1 1.2-2.6 1.8-4.8 1.8h-2.2v-4.1h1.4c1.1 0 1.9-.3 2.4-.9.5-.6.8-1.5.8-2.8V16.5h.1z"
        fill="#ffffff"
      />
    </svg>
  );
}

/** Official Google Pay (GPay) Vector Logo */
export function SvglGooglePay({ size = 20, className, ...props }: SvglIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <path
        fill="#4285F4"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
      />
      <path
        fill="#34A853"
        d="M46.9 24.5c0-1.6-.1-3.2-.4-4.5H24v9h12.9c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.3-10.1 7.3-17.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.5 28.6c-.5-1.5-.8-3.1-.8-4.6 0-1.6.3-3.1.8-4.6l-7.9-6.1C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.9-6.1z"
      />
      <path
        fill="#EA4335"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.2 1.5-5 2.4-8.4 2.4-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

/** Official Paytm Vector Logo */
export function SvglPaytm({ size = 20, className, ...props }: SvglIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <rect width="48" height="48" rx="10" fill="#002e6e" />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="14"
        fontWeight="900"
        fill="#00baf2"
        letterSpacing="0.5"
      >
        Paytm
      </text>
    </svg>
  );
}

/** Official BHIM UPI Vector Logo */
export function SvglBhim({ size = 20, className, ...props }: SvglIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <circle cx="24" cy="24" r="23" fill="#008060" />
      <polygon points="12,36 24,10 36,36 24,28" fill="#ffffff" />
      <polygon points="20,29 24,19 28,29 24,26" fill="#f58220" />
    </svg>
  );
}

/** Official RuPay Vector Logo */
export function SvglRupay({ size = 20, className, ...props }: SvglIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <rect width="48" height="48" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
      <polygon points="10,12 24,24 10,36" fill="#0066b2" />
      <polygon points="20,12 34,24 20,36" fill="#f37021" />
      <text x="32" y="30" fontFamily="sans-serif" fontSize="11" fontWeight="900" fontStyle="italic" fill="#0066b2">
        ₹
      </text>
    </svg>
  );
}

/** Dynamic Helper to resolve SVGL Icon by channel/payment brand name */
export function getSvglIcon(name: string, props: SvglIconProps = {}) {
  const n = name.toLowerCase().trim();
  switch (n) {
    case "whatsapp":
      return <SvglWhatsapp {...props} />;
    case "telegram":
      return <SvglTelegram {...props} />;
    case "instagram":
      return <SvglInstagram {...props} />;
    case "facebook":
    case "fb":
      return <SvglFacebook {...props} />;
    case "messenger":
      return <SvglMessenger {...props} />;
    case "x":
    case "twitter":
      return <SvglX {...props} />;
    case "google":
      return <SvglGoogle {...props} />;
    case "gmail":
    case "email":
    case "mail":
      return <SvglGmail {...props} />;
    case "github":
      return <SvglGithub {...props} />;
    case "apple":
      return <SvglApple {...props} />;
    case "upi":
      return <SvglUpi {...props} />;
    case "phonepe":
      return <SvglPhonePe {...props} />;
    case "gpay":
    case "googlepay":
      return <SvglGooglePay {...props} />;
    case "paytm":
      return <SvglPaytm {...props} />;
    case "bhim":
      return <SvglBhim {...props} />;
    case "rupay":
      return <SvglRupay {...props} />;
    case "paypal":
      return <SvglPaypal {...props} />;
    case "stripe":
      return <SvglStripe {...props} />;
    case "twilio":
    case "sms":
      return <SvglTwilio {...props} />;
    case "youtube":
      return <SvglYoutube {...props} />;
    case "linkedin":
      return <SvglLinkedin {...props} />;
    case "discord":
      return <SvglDiscord {...props} />;
    case "nextjs":
      return <SvglNextjs {...props} />;
    case "react":
      return <SvglReact {...props} />;
    case "tailwindcss":
      return <SvglTailwindcss {...props} />;
    case "python":
      return <SvglPython {...props} />;
    case "fastapi":
      return <SvglFastapi {...props} />;
    case "sqlite":
      return <SvglSqlite {...props} />;
    case "vercel":
      return <SvglVercel {...props} />;
    default:
      return null;
  }
}
'''

full_code = header + "\n\n" + "\n\n".join(components) + "\n\n" + indian_payment_icons

with open(output_path, 'w', encoding='utf-8') as fh:
    fh.write(full_code)

print(f"Successfully generated {output_path} with {len(components) + 6} icons!")
