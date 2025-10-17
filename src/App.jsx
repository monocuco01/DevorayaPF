import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Restaurant from "./pages/RestaurantDetail/Restaurant";
import DetailNavBar from "./componets/DetailNavBar/DetailNavBar";
import CategoriaPage from "./pages/CategoriaPage/CategoriaPage";
import Login from "./pages/Login/Login";
function App() {
  return (
    <Router>
         <DetailNavBar /> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurant/:id" element={<Restaurant />} />
          <Route path="/categoria/:nombre" element={<CategoriaPage />} />
             <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
