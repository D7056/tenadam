import { useRef, useState } from "react";
import "../css/form.css";
import heroImage from "../assets/hero-image.png";
import { Link } from "react-router-dom";
import DropDown from "./DropDown";

type Input = {
  type: string;
  name: string;
  placeholder?: string;
  required?: boolean;
};

type FormProps = {
  title: string;
  inputs: Input[];
  links: { link: string; text: string }[];
  onSubmit: (data: { [key: string]: any }) => void;
};
function Forms({ title, inputs, links, onSubmit }: FormProps) {
  const [isVisible, setIsVisible] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const handleVisibilityToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    passwordRef.current?.focus();
    setIsVisible((prev: boolean) => !prev);
  };
  return (
    <>
      <img src={heroImage} alt="Hero" className="hero-image" />
      <h1>{title}</h1>
      <div className="form-container">
        <form className="form" onSubmit={onSubmit}>
          {title === "Doctor Register" && (
            <DropDown
              label="Service Type"
              options={["Medicne Dealer", "Delivery Man", "Dotor"]}
            ></DropDown>
          )}
          {inputs.map((input) => {
            if (input.type === "tel") {
              return (
                <div key={input.name} className="tel-field">
                  <span className="tel-prefix">+251</span>
                  <input
                    type={input.type}
                    name={input.name}
                    placeholder={input.placeholder}
                    required={input.required}
                  />
                </div>
              );
            }
            if (input.type === "password") {
              return (
                <div className="password-field" key={input.name}>
                  <input
                    type={isVisible ? "text" : "password"}
                    name={input.name}
                    placeholder={input.placeholder}
                    required={input.required}
                    ref={passwordRef}
                  />
                  <button
                    className="password-toggle"
                    style={{ color: isVisible ? "black" : "white" }}
                    aria-label="Show password"
                    onClick={handleVisibilityToggle}
                  >
                    <i className="material-icons">visibility</i>
                  </button>
                </div>
              );
            }
            return (
              <div className="input-field" key={input.name}>
                <input
                  type={input.type}
                  name={input.name}
                  placeholder={input.placeholder}
                  required={input.required}
                />
              </div>
            );
          })}

          <button type="submit" className="btns">
            {title}
          </button>
          {links.map((obj, _index) => {
            return (
              <Link key={obj.link ?? _index} to={obj.link}>
                {obj.text}
              </Link>
            );
          })}
        </form>
      </div>
    </>
  );
}

export default Forms;
