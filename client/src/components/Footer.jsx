const Footer = () => (
  <footer className="bg-ink text-white px-8 py-11 pb-7 font-body">
    <div className="max-w-[900px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
      <div>
        <div className="font-display font-bold text-lg text-white flex items-center gap-1.5">
          <span className="text-orange">●</span>CampusHire
        </div>
        <p className="text-muted2 text-sm mt-3 max-w-xs">
          Connecting students with the right opportunities, and companies with the right talent.
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-3 text-sm">Explore</h4>
        <ul className="text-muted2 text-sm space-y-2">
          <li>Jobs</li>
          <li>Companies</li>
          <li>About</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-3 text-sm">Account</h4>
        <ul className="text-muted2 text-sm space-y-2">
          <li>Login</li>
          <li>Register</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-3 text-sm">Contact</h4>
        <ul className="text-muted2 text-sm space-y-2">
          <li>support@campushire.com</li>
        </ul>
      </div>
    </div>
    <p className="text-center text-muted2 text-xs border-t border-white/10 pt-5">
      © {new Date().getFullYear()} CampusHire. All rights reserved.
    </p>
  </footer>
);

export default Footer;
