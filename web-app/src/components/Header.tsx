import Link from 'next/link'

const Header = () => {
  return (
    <header className="py-8">
      <div className="container">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Logo placeholder */}
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              {/* Replace with your actual logo */}
              <span className="text-white font-bold">H2F</span>
            </div>
            <span className="text-xl font-bold text-gray-800">HTML to Figma</span>
          </div>
          <nav>
            <ul className="flex space-x-8">
              <li>
                <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/your-username/html-to-figma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header