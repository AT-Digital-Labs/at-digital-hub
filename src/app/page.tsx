import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { Process } from "@/components/sections/process";
import { Product } from "@/components/sections/product";
import { Services } from "@/components/sections/services";
import { captchaSiteKey, isContactAvailable } from "@/lib/contact/availability";

// Re-render daily so the footer's copyright year stays current without a manual redeploy.
export const revalidate = 86400;

export default function HomePage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <Hero />
      <Services />
      <Product />
      <Process />
      <About />
      <Contact deliveryAvailable={isContactAvailable()} captchaSiteKey={captchaSiteKey()} />
    </main>
  );
}
