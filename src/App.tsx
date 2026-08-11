import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Medicine from "./pages/Medicine";
import Appointment from "./pages/Appointment";
import Pharmacy from "./pages/Pharmacy";
import Inventory from "./pages/Inventory";
import DoctorDashboard from "./pages/DoctorDashboard";
import Availability from "./pages/Availability";
import Appointments from "./pages/Appointments";
import DoctorListing from "./pages/DoctorListing";
import GiveHope from "./pages/GiveHope";
import CauseListing from "./pages/CauseListing";
import SubmitCause from "./pages/SubmitCause";
import MyCauses from "./pages/MyCauses";
import MyDonations from "./pages/MyDonations";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";


import UserLogin from "./pages/Authentication/UserLogin";
import UserRegister from "./pages/Authentication/UserRegister";
import HealthCareProviderLogin from "./pages/Authentication/HealthCareProviderLogin";
import HealthCareProviderRegister from "./pages/Authentication/HealthCareProviderRegister";
import CompleteProfile from "./pages/Authentication/CompleteProfile";

import LayoutWithNav from "./Layout/LayoutWithNav";
import LayoutWithNoNav from "./Layout/LayoutWithNoNav";

import { CartContextProvider } from "./context/cartContext";
import { UserInfoProvider } from "./context/userInfoContext";
import { AppointmentContextProvider } from "./context/appointmentContext";
import { DonationContextProvider } from "./context/donationContext";
import { OrderContextProvider } from "./context/orderContext";
import { PharmacyContextProvider } from "./context/pharmacyContext";

import UserRoute from "./pages/Authentication/UserRoute";
import ProviderRoute from "./pages/Authentication/ProviderRoute";

import "./css/App.css";
import Cart from "./pages/Cart";

export default function App() {
  return (
    <CartContextProvider>
      <AppointmentContextProvider>
        <DonationContextProvider>
          <OrderContextProvider>
            <PharmacyContextProvider>
              <UserInfoProvider>
                <Routes>
                  {/* Public layout (shows navbar) */}
                  <Route element={<LayoutWithNav />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/medicine" element={<Medicine />} />
                    <Route path="/doctorlisting" element={<DoctorListing />} />
                    <Route path="/book/:doctorId?" element={<Appointment />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/give-hope" element={<CauseListing />} />
                    <Route path="/submit-cause" element={<SubmitCause />} />
                    <Route path="/my-causes" element={<MyCauses />} />
                    <Route path="/give-hope/:causeId" element={<GiveHope />} />
                    <Route path="/donations" element={<MyDonations />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders" element={<MyOrders />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/profile" element={<Profile />} />

                    {/* authenticated user-only routes */}
                    <Route element={<UserRoute />}>
                      {/* add user-only routes here */}
                    </Route>

                    {/* provider-only routes */}
                    <Route element={<ProviderRoute />}>
                      <Route path="/medicinedealer" element={<Pharmacy />} />
                      <Route
                        path="/medicinedealer/inventory"
                        element={<Inventory />}
                      />
                      <Route path="/doctor" element={<DoctorDashboard />} />
                      <Route
                        path="/doctor/availability"
                        element={<Availability />}
                      />
                    </Route>
                  </Route>

                  {/* Auth pages (no nav) */}
                  <Route element={<LayoutWithNoNav />}>
                    <Route path="/login" element={<UserLogin />} />
                    <Route path="/register" element={<UserRegister />} />
                    <Route
                      path="/doctorlogin"
                      element={<HealthCareProviderLogin />}
                    />
                    <Route
                      path="/doctorregister"
                      element={<HealthCareProviderRegister />}
                    />
                    <Route
                      path="/complete-profile"
                      element={<CompleteProfile />}
                    />
                  </Route>
                </Routes>
              </UserInfoProvider>
            </PharmacyContextProvider>
          </OrderContextProvider>
        </DonationContextProvider>
      </AppointmentContextProvider>
    </CartContextProvider>
  );
}
