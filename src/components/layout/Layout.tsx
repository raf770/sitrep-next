import TopBar from "./TopBar";
import Logo from "./Logo";
import Nav from "./Nav";
import Ticker from "./Ticker";
import Footer from "./Footer";

export default function Layout({ children, ticker }: { children: React.ReactNode; ticker?: any[] }) {
  return (
    <div className="min-h-screen bg-sand font-inter overflow-x-hidden">
      <TopBar />
      <Logo />
      <Nav />
      <Ticker items={ticker || []} />
      <main className="w-full">{children}</main>
      <Footer />
    </div>
  );
}
