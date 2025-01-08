import React, { useState } from "react";
import { Link } from "react-router-dom";

const MenuUsuario = ({ setMenuOpen }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setMenuOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setMenuOpen(false);
  };

  return (
    <>
    </>
  )
}
export default MenuUsuario;