import LandingNav from "@/components/landingnav"
import LandingFooter from "@/components/landingfooter"

export default function PolicyGroupLayout({ children }: { children: React.ReactNode }) {
  
  return <>
  <LandingNav />
  {children}
  <LandingFooter />
  </>
}
