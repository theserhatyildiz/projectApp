import { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import FoodData from "./FoodData";
import Header from './Header';
import Footer from "./Footer";
import { UserContext } from "../context/UserContext";

export default function SearchFood() {
    // ------------------Variables------------------
    const loggedData = useContext(UserContext);

    const location = useLocation();
    const { foodItem, details, quantity, id, mealNumber, eatenDate } = location.state || {};

    console.log("search-eaten-date:", eatenDate)

    const [foodItems, setFoodItems] = useState([]);
    const [food, setFood] = useState(foodItem || null);

    useEffect(() => {
        if (foodItem) {
            setFood(foodItem);
        }
    }, [foodItem]);

    // ------------------Functions------------------
    function searchFood(event) {
        if (event.target.value.length !== 0) {
            // ------------------Calling the data to API------------------
            fetch(`https://galwinapp-7861c5aaed27.herokuapp.com/foods/${event.target.value}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${loggedData.loggedUser.token}`
                }
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.message === undefined) {
                        setFoodItems(data);
                    } else {
                        setFoodItems([]);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            setFoodItems([]);
        }
    }

    // Function to close the search container
    function closeSearchContainer() {
        setFoodItems([]);
    }

    return (
        <section className="container search-container">
            <Header />
            <Footer/>
            <div className="search">
                <input className="search-inp" type="search" onChange={searchFood} placeholder="Yiyecek Arayın" />
                {foodItems.length !== 0 && (
                    <div className="search-results">
                        {foodItems.map((item) => (
                            <p className="item" onClick={() => { setFood(item); closeSearchContainer(); }} key={item._id}>{item.NameTr}</p>
                        ))}
                    </div>
                )}
            </div>
            {food !== null ? (
                <FoodData food={food} quantity={quantity} details={details} id={id} mealNumber={mealNumber} eatenDate={eatenDate} />
            ) : null}
        </section>
    );
}
