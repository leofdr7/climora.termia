import { THEME_COOKIE_NAME } from "@/lib/theme/theme";

const THEME_INIT_SCRIPT = `(function(){try{var n=${JSON.stringify(THEME_COOKIE_NAME)};var m=document.cookie.match(new RegExp("(?:^| )"+n+"=([^;]+)"));var t=m?decodeURIComponent(m[1]):"system";var r=document.documentElement;if(t==="dark"){r.classList.add("dark");}else if(t==="light"){r.classList.remove("dark");}else{var d=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;if(d){r.classList.add("dark");}else{r.classList.remove("dark");}}}catch(e){}})();`;

export function ThemeScript() {
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
