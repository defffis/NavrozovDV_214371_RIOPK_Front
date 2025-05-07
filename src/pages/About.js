import React from "react";
import Layout from "./../components/Layout";
import "../../src/styles/About.css"

const About = () => {
  return (
    <Layout title={"Информация"}>
      <div className="row contactus">
        <div className="col-md-6 ">
          <img
            src="/images/about.jpg"
            alt="contactus"
            style={{ width: "100%" }}
          />
        </div>
        <div className="col-md-4">
          <p className="text-justify mt-2">
            Приемка, пример текста
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;
