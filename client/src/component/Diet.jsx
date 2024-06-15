import { UserContext } from "../context/UserContext"; 
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from './Header';
import Footer from "./Footer";
import Meal from "./Meal";
import ObjectId from 'bson-objectid';
import MoonLoader from "react-spinners/MoonLoader";

export default function Diet() {
    // ------------------Variables------------------

    const { loggedUser, currentDateView, setCurrentDateView } = useContext(UserContext);
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState({
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        totalFiber: 0
    });
    const [loading, setLoading] = useState(true); // Initial loading state set to true
    const [color] = useState("#d73750"); // Color state for ClipLoader

    // ------------------Functions------------------

    useEffect(() => {
        fetch(`https://galwinapp-7861c5aaed27.herokuapp.com/track/${loggedUser.userid}/${currentDateView.getMonth() + 1}-${currentDateView.getDate()}-${currentDateView.getFullYear()}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${loggedUser.token}`
            }
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            setItems(data);
            setLoading(false); // Set loading to false after data is fetched
        })
        .catch((err) => {
            console.log(err);
            setLoading(false); // Set loading to false even if there is an error
        });
    }, [loggedUser, currentDateView]);

    useEffect(() => {
        calculateTotal();
    }, [items]);

    const handleDeleteFood = (foodId) => {
        deleteFood(foodId)
        .then(() => {
            setItems(prevItems => prevItems.filter(item => item._id !== foodId));
            calculateTotal();
        })
        .catch(error => {
            console.error("Error deleting food:", error);
        });
    };

    function deleteFood(itemId) {
        return fetch(`https://galwinapp-7861c5aaed27.herokuapp.com/track/${itemId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${loggedUser.token}`
            }
        })
        .then(response => {
            if (response.ok) {
                console.log("Food deleted successfully");
            } else {
                throw new Error(`Error deleting food: ${response.statusText}`);
            }
        })
        .catch(error => {
            console.error("Error deleting food:", error);
            throw error;
        });
    }

    function calculateTotal() {
        let totalCopy = {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFats: 0,
            totalFiber: 0
        };

        items.forEach((item) => {
            totalCopy.totalCalories += item.details.Calorie;
            totalCopy.totalProtein += item.details.Protein;
            totalCopy.totalCarbs += item.details.Carbohydrate;
            totalCopy.totalFats += item.details.Fat;
            totalCopy.totalFiber += item.details.Fiber;
        });

        totalCopy.totalCalories = parseFloat(totalCopy.totalCalories.toFixed(1));
        totalCopy.totalProtein = parseFloat(totalCopy.totalProtein.toFixed(1));
        totalCopy.totalCarbs = parseFloat(totalCopy.totalCarbs.toFixed(1));
        totalCopy.totalFats = parseFloat(totalCopy.totalFats.toFixed(1));
        totalCopy.totalFiber = parseFloat(totalCopy.totalFiber.toFixed(1));

        setTotal(totalCopy);
    }

    const meals = [
        { number: 1, title: "1.Öğün" },
        { number: 2, title: "2.Öğün" },
        { number: 3, title: "3.Öğün" },
        { number: 4, title: "4.Öğün" },
        { number: 5, title: "5.Öğün" },
        { number: 6, title: "6.Öğün" },
    ];

    const mealItems = [];

    meals.forEach((meal) => {
        const mealItemsArray = items.filter((item) => item.mealNumber === meal.number);
        mealItemsArray.forEach((item) => {
            item.mealNumber = meal.number;
        });
        mealItems.push(...mealItemsArray);
    });

    return (
        <>
            <section className="container diet-container">
                {loading ? (
                    <div className="spinner-container">
                        <MoonLoader
                            color={color}
                            loading={loading}
                            size={25}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </div>
                ) : (
                    <>
                        <Header />
                        <div className="fixed-header">
                            <input className="date-box" type="date" value={currentDateView.toISOString().slice(0, 10)} onChange={(event) => {
                                setCurrentDateView(new Date(event.target.value));
                            }}/>

                            <div className="totals-container">
                                <div className="total-macros">
                                    <div>
                                        <h3>Total Kalori: {total.totalCalories} kcal</h3>
                                    </div>

                                    <div className="totals-row">
                                        <div className="totals">
                                            <p className="n-title">Pro</p>
                                            <p className="n-value">{total.totalProtein}g</p>
                                        </div>
                                        <div className="totals">
                                            <p className="n-title">Karb</p>
                                            <p className="n-value">{total.totalCarbs}g</p>
                                        </div>
                                        <div className="totals">
                                            <p className="n-title">Yağ</p>
                                            <p className="n-value">{total.totalFats}g</p>
                                        </div>
                                        <div className="totals">
                                            <p className="n-title">Lif</p>
                                            <p className="n-value">{total.totalFiber}g</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="scrollable-content">
                            {meals.map((meal) => (
                                <Meal 
                                    key={meal.number} 
                                    items={mealItems.filter((item) => item.mealNumber === meal.number)} 
                                    mealNumber={meal.number} 
                                    deleteFood={handleDeleteFood}
                                    eatenDate={currentDateView.toISOString().slice(0, 10)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </section>
            <Footer />
        </>
    );
}
