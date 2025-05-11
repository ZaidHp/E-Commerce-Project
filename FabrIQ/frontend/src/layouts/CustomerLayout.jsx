import Navbar from "../customer_components/CustomerNavbar";
import Footer from "../customer_components/CustomerFooter";

const CustomerLayout = ({ children }) => {
	return (
		<>
			<Navbar />
			<div> {/* pt-16 = 64px (matches fixed navbar height) */}
  				<div>
                    {children}
  			    </div>
            </div>
            <Footer/>
		</>
	);
};

export default CustomerLayout;