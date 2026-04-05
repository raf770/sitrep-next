import TopBar from "./TopBar";
import Logo from "./Logo";
import Nav from "./Nav";
import Ticker from "./Ticker";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sand font-inter">
      <TopBar />
      <Logo />
      <Nav />
      <Ticker />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
