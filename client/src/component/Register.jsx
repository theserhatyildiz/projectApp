import { useState } from "react"
import { Link } from "react-router-dom"

export default function Register()
{

    // ------------------Variables------------------

    const [userDetails, setUserDetails] = useState({
        name:"",
        email:"",
        password:"",
        passwordConfirm: "",
        age:""
    })

    const [message, setMessage] = useState({
        type:"invisible-msg",
        text:"Dummy Msg"
    })

    // ------------------Functions------------------

    function handleInput(event)
    {
        setUserDetails((prevState)=>{
            return{...prevState,[event.target.name]:event.target.value}
        })
    }

    function handleSubmit(event)
    {
        event.preventDefault();
        console.log(userDetails);

    // Check if passwords match
    if (userDetails.password !== userDetails.passwordConfirm) {
        setMessage({ type: "error", text: "Şifreler uyuşmuyor!" });
        return;
    }


    // ------------------Sending the data to API------------------

    fetch("http://localhost:8000/register", {
            method: "POST",
            body: JSON.stringify(userDetails),
            headers: {
                "Content-type": "application/json"
            }
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.message === 'Email zaten kayıtlı!') {
                setMessage({ type: "error", text: data.message });
            } else {
                setMessage({ type: "success", text: data.message });

                setUserDetails({
                    name: "",
                    email: "",
                    password: "",
                    passwordConfirm: "",
                    age: ""
                });

                setTimeout(() => {
                    setMessage({ type: "invisible-msg", text: "Dummy Msg" });
                }, 3000);
            }
        })
        .catch((err) => {
            console.log(err);
        });
    }


    return(
        <section className="container">

            <form className="form" onSubmit={handleSubmit}>

                <h1>Galwin Nutrition App</h1>

                <input className="inp" type="text" onChange={handleInput} placeholder="İsim Girin" name="name" value={userDetails.name} required/>
                <input className="inp" type="email" onChange={handleInput} placeholder="Email Girin" name="email" value={userDetails.email} required/>
                <input className="inp" type="password" minLength={8} onChange={handleInput} placeholder="Şifre Girin" name="password" value={userDetails.password} required/>
                <input className="inp" type="password" minLength={8} onChange={handleInput} placeholder="Şifreyi Onayla" name="passwordConfirm" value={userDetails.passwordConfirm} required/>
                <input className="inp" type="number" onChange={handleInput} placeholder="Yaş Girin" name="age" value={userDetails.age} required/>

                <button className="btn">Kayıt Ol</button>

                <p>Üye misiniz? <Link to="/login">Giriş Yap</Link></p>

                <p className={message.type}>{message.text}</p>

            </form>

        </section>
    )
}