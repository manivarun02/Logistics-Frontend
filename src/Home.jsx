import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const truckRef = useRef(null);
  const warehouseRef = useRef(null);
  const cargoRef = useRef(null);

  const navigate = useNavigate(); // <-- for routing

  useEffect(() => {
    const truck = truckRef.current;
    const warehouse = warehouseRef.current;
    const cargo = cargoRef.current;

    const runAnimation = () => {
      if (!truck || !warehouse || !cargo) return;

      cargo.innerHTML = "";

      const warehouseCenter =
        warehouse.offsetLeft + warehouse.offsetWidth / 2;
      const truckStopX = warehouseCenter + 60; // Adjust for your scene

      const tl = gsap.timeline({ repeat: -1 });

      // 1. Truck drives to warehouse
      tl.to(truck, {
        duration: 3,
        x: truckStopX,
        ease: "power2.inOut",
      });

      // 2. Load exactly 3 boxes after truck stops
      tl.call(
        () => {
          cargo.innerHTML = "";
          for (let i = 0; i < 3; i++) {
            const box = document.createElement("img");
            box.src = "/images/Cardboardbox.png";
            box.className = "cargo-box";
            cargo.appendChild(box);
          }
        },
        null,
        "+=0.5"
      );

      // 3. Truck leaves with boxes
      tl.to(truck, {
        duration: 3,
        x: window.innerWidth + 300,
        ease: "power2.inOut",
      });

      // 4. Reset truck and clear boxes before next loop
      tl.set(truck, { x: -300 });
      tl.call(() => {
        cargo.innerHTML = "";
      });
    };

    const timeoutId = setTimeout(runAnimation, 300);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src="/images/Cardboardbox.png" width="45" alt="Logo" />
          MVC LOGISTICS
        </div>
        <nav className="nav">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/login")}>Login</button>
          {/* you can create /register route later */}
          <button onClick={() => navigate("/register")}>Register</button>
        </nav>
      </header>

      <div className="title">
        <h1>Smart Logistics 📦</h1>
        <h2>Warehouse Management</h2>
      </div>

      <div className="scene">
        <img
          ref={warehouseRef}
          className="warehouse"
          src="/images/Warehouse.png"
          alt="Warehouse"
        />

        <div ref={truckRef} className="truck">
          <img
            src="/images/Truck.png"
            className="truck-img"
            alt="Truck"
          />
          <div ref={cargoRef} className="cargo-container"></div>
        </div>

        <div className="road"></div>
      </div>
    </>
  );
}
