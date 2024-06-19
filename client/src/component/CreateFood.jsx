import { UserContext } from "../context/UserContext";
import { useContext } from "react";
import { useState } from "react";
import Header from './Header';
import Footer from "./Footer";

export default function CreateFood() {
  // ------------------Variables------------------

  const loggedData = useContext(UserContext);

  const [foodDetails, setFoodDetails] = useState({
    NameTr: "",
    Calorie: "",
    Protein: "",
    Carbohydrate: "",
    Fat: "",
    Fiber: "",
    userId: loggedData.loggedUser.userid 
  });

  const [message, setMessage] = useState({ 
    type: "", 
    text: "" 
  });

  // ------------------Functions------------------

  function handleInput(event) {
    setFoodDetails((prevState) => {
      return { ...prevState, [event.target.name]: event.target.value, userId: loggedData.loggedUser.userid};
    });
  }


  function handleSubmit(event) {
    event.preventDefault();
    console.log(foodDetails);



    // ------------------Sending the data to API------------------

    fetch("https://galwinapp-7861c5aaed27.herokuapp.com/foods",{
        method:"POST",
        body:JSON.stringify(foodDetails),
        headers:{
            "Authorization":`Bearer ${loggedData.loggedUser.token}`,
            "Content-Type":"application/json"
        }

    })
    .then((response) => {
      if (response.status === 201) {
          setMessage({ type: "success", text: "Yiyecek oluşturuldu!" });
          
      } else {
          setMessage({ type: "error", text: "Bir hata oluştu!" });
      }

      setTimeout(() => {
          setMessage({ type: "", text: "" })
      }, 2000);
      return response.json();
  })
  .then((data) => {
      console.log(data)
  })
  .catch((err) => {
      console.log(err)
  });
}


 
  return (
   
    <section className="container createfood-container">
         <Header/>
         <Footer/>
      <form className="form" onSubmit={handleSubmit}>
        <h1>Yeni Yiyecek</h1>
        <div>
          <span>100g besin değerlerini girin.</span>
        </div>

        <div className="create-food-info">
          <div className="name-calorie-form">
            <h2 className="name-form">İsim: </h2>
            <input
              type="text"
              onChange={handleInput}
              className="inp-name"
              placeholder="Gerekli"
              name="NameTr"
              value={foodDetails.NameTr}
              required
            />

            <h2 className="calorie-form">Kalori: </h2>
            <input
              type="number"
              onChange={handleInput}
              className="inp-cal"
              placeholder="Gerekli"
              name="Calorie"
              value={foodDetails.Calorie}
              required
            />
          </div>

          <div className="nutrient">
            <p className="n-title">Pro</p>
            <input
              type="number"
              onChange={handleInput}
              className="inp-create"
              placeholder="Gerekli"
              name="Protein"
              value={foodDetails.Protein}
              required
            />
          </div>

          <div className="nutrient">
            <p className="n-title">Karb</p>
            <input
              type="number"
              onChange={handleInput}
              className="inp-create"
              placeholder="Gerekli"
              name="Carbohydrate"
              value={foodDetails.Carbohydrate}
              required
            />
          </div>

          <div className="nutrient">
            <p className="n-title">Yağ</p>
            <input
              type="number"
              onChange={handleInput}
              className="inp-create"
              placeholder="Gerekli"
              name="Fat"
              value={foodDetails.Fat}
              required
            />
          </div>

          <div className="nutrient">
            <p className="n-title">Lif</p>
            <input
              type="number"
              onChange={handleInput}
              className="inp-create"
              placeholder="Gerekli"
              name="Fiber"
              value={foodDetails.Fiber}
              required
            />
          </div>

          <button className="btn-add">Oluştur</button>
        </div>
        <p className={message.type}>{message.text}</p>
      </form>
    </section>
  );
}