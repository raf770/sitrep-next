import TopBar from "./TopBar";
import Logo from "./Logo";
import Nav from "./Nav";
import Ticker from "./Ticker";
import Footer from "./Footer";

interface SiteData {
  ticker?: any[];
  header?: any;
  footer?: any;
}

export default function Layout({ children, siteData }: { children: React.ReactNode; siteData?: SiteData }) {
  return (
    <div className="min-h-screen bg-sand font-inter overflow-x-hidden">
      <TopBar />
      <Logo header={siteData?.header} />
      <Nav links={siteData?.header?.navLinks} />
      <Ticker items={siteData?.ticker || []} />
      <main className="w-full">{children}</main>
      <Footer footer={siteData?.footer} />
    </div>
  );
}
