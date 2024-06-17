import { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import FoodData from "./FoodData";
import Header from './Header';
import Footer from "./Footer";
import { UserContext } from "../context/UserContext";
import ClipLoader from "react-spinners/ClipLoader"; // Import ClipLoader

export default function SearchFood() {
    // ------------------Variables------------------
    const loggedData = useContext(UserContext);

    const location = useLocation();
    const { foodItem, details, quantity, id, mealNumber, eatenDate } = location.state || {};

    console.log("search-eaten-date:", eatenDate);

    const [foodItems, setFoodItems] = useState([]);
    const [food, setFood] = useState(foodItem || null);

    const [loading, setLoading] = useState(false); // Initial loading state set to false
    const [color] = useState("#d73750"); // Color state for ClipLoader

    useEffect(() => {
        if (foodItem) {
            setFood(foodItem);
        }
    }, [foodItem]);

    // ------------------Functions------------------
    function searchFood(event) {
        const query = event.target.value;
        if (query.length !== 0) {
            setLoading(true); // Set loading to true when search starts
            // ------------------Calling the data to API------------------
            fetch(`https://galwinapp-7861c5aaed27.herokuapp.com/foods/${query}`, {
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
                    setLoading(false); // Set loading to false after data is fetched
                })
                .catch((err) => {
                    console.log(err);
                    setLoading(false); // Set loading to false after data is fetched
                });
        } else {
            setFoodItems([]);
            setLoading(false); // Ensure loading is set to false when input is cleared
        }
    }

    // Function to close the search container
    function closeSearchContainer() {
        setFoodItems([]);
    }

    return (
        <section className="container search-container">
            <Header />
            <Footer />
            <div className="search">
                <input className="search-inp" type="search" onChange={searchFood} placeholder="Yiyecek Arayın" />
                {loading ? (
                    <div className="spinner-container-searchFood">
                        <ClipLoader
                            color={color}
                            loading={loading}
                            size={25}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </div>
                ) : (
                    foodItems.length !== 0 && (
                        <div className="search-results">
                            {foodItems.map((item) => (
                                <p className="item" onClick={() => { setFood(item); closeSearchContainer(); }} key={item._id}>{item.NameTr}</p>
                            ))}
                        </div>
                    )
                )}
            </div>
            {food !== null ? (
                <FoodData food={food} quantity={quantity} details={details} id={id} mealNumber={mealNumber} eatenDate={eatenDate} />
            ) : null}
        </section>
    );
}
