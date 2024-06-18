import { useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function FoodData(props) {
    // ------------------Variables------------------ 
    const location = useLocation();
    const { foodItem, details, quantity, id, mealNumber: initialMealNumber, eatenDate } = location.state || {};

    const [food, setFood] = useState(details || null);
    const [foodInitial, setFoodInitial] = useState({});
    const [eatenQuantity, setEatenQuantity] = useState(quantity || 100);
    const [mealNumber, setMealNumber] = useState(initialMealNumber || 1);

    console.log("food-meal-number:", mealNumber);
    console.log("food-eaten-date:", eatenDate);

    const handleMealNumberChange = (event) => {
        setMealNumber(parseInt(event.target.value)); // Convert value to integer
    };

    let loggedData = useContext(UserContext);

    const [message, setMessage] = useState({
        type: "",
        text: ""
    });

    const navigate = useNavigate();

    useEffect(() => {
        setFood({ ...details || props.food, _id: props.food._id });
        setFoodInitial(props.food);
    }, [props.food, details]);

    useEffect(() => {
        if (details) {
            setFood(prevState => ({ ...prevState, NameTr: details.Name, _id: details.foodId }));
        }
    }, [details]);

    // ------------------Functions------------------
    function calculateMacros(event) {
        if (event.target.value.length !== 0) {
            let quantity = Number(event.target.value);
            setEatenQuantity(quantity);
            let copyFood = { ...food };
            copyFood.Protein = (foodInitial.Protein * quantity) / 100;
            copyFood.Carbohydrate = (foodInitial.Carbohydrate * quantity) / 100;
            copyFood.Fat = (foodInitial.Fat * quantity) / 100;
            copyFood.Fiber = (foodInitial.Fiber * quantity) / 100;
            copyFood.Calorie = (foodInitial.Calorie * quantity) / 100;
            setFood(copyFood);
        }
    }

    function createFoodItem(trackedItem) {
        fetch("http://localhost:8000/track", {
            method: "POST",
            body: JSON.stringify(trackedItem),
            headers: {
                "Authorization": `Bearer ${loggedData.loggedUser.token}`,
                "Content-type": "application/json"
            }
        })
            .then((response) => {
                if (response.status === 201) {
                    setMessage({ type: "success", text: "Başarıyla eklendi!" });
                    navigate("/diet");
                } else {
                    setMessage({ type: "error", text: "Bir hata oluştu!" });
                }
                setTimeout(() => {
                    setMessage({ type: "", text: "" });
                }, 1000);
                return response.json();
            })
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function updateFoodItem(trackedItem) {
        console.log(`Updating food tracking record with ID: ${trackedItem.id}`);
        fetch(`http://localhost:8000/track/${trackedItem.id}`, {
            method: "PUT",
            body: JSON.stringify(trackedItem),
            headers: {
                "Authorization": `Bearer ${loggedData.loggedUser.token}`,
                "Content-type": "application/json"
            }
        })
            .then((response) => {
                if (response.status === 200) {
                    setMessage({ type: "success", text: "Başarıyla güncellendi!" });
                    navigate("/diet");
                } else {
                    setMessage({ type: "error", text: "Bir hata oluştu!" });
                }
                setTimeout(() => {
                    setMessage({ type: "", text: "" });
                }, 1000);
                return response.json();
            })
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function trackFoodItem() {
        let trackedItem = {
            userId: loggedData.loggedUser.userid,
            foodId: foodItem ? foodItem._id : food._id,
            details: {
                Name: food.NameTr,
                foodId: foodItem ? foodItem._id : food._id,
                Protein: food.Protein,
                Carbohydrate: food.Carbohydrate,
                Fat: food.Fat,
                Fiber: food.Fiber,
                Calorie: food.Calorie
            },
            quantity: eatenQuantity,
            mealNumber: mealNumber,
            eatenDate: eatenDate,
            id: id
        };

        console.log("trackedItem:", trackedItem);
        console.log("Food ID:", food._id ? "Exists" : "Does not exist");

        if (foodItem && foodItem._id) {
            updateFoodItem(trackedItem);
        } else {
            createFoodItem(trackedItem);
        }
    }

    function formatNumber(number) {
        if (number % 1 === 0) {
            return number.toString(); // No decimals if the number is an integer
        } else {
            return parseFloat(number.toFixed(1)).toString(); // Convert to float to remove trailing zeros and then to string
        }
    }

    return (
        <div className="food">
            {food && ( // Add conditional check here
                <>
                    <h3>
                        {food.NameTr} - <span className="eatenQuantity">{eatenQuantity}g:</span> <span className="calorie">{formatNumber(food.Calorie)}kcal</span>
                    </h3>

                    <div className="macros">

                        <div className="nutrient">
                            
                                <div className="macro-details">
                                    <p className="n-title">Protein</p>
                                    <p className="n-value">{formatNumber(food.Protein)}g</p>
                                </div>

                                <div className="macro-details">
                                    <p className="n-title">Karb</p>
                                    <p className="n-value">{formatNumber(food.Carbohydrate)}g</p>
                                </div>
                           
                                <div className="macro-details">
                                    <p className="n-title">Yağ</p>
                                    <p className="n-value">{formatNumber(food.Fat)}g</p>
                                </div>

                                <div className="macro-details">
                                    <p className="n-title">Lif</p>
                                    <p className="n-value">{formatNumber(food.Fiber)}g</p>
                                </div>
                            
                        </div>

                    </div>
                  <div className="food-quantity-button">

                     <div className="meal-label-selection">
                        <label className="meal-label">Öğün seçin: </label>
                            <select className="meal-selection" value={mealNumber} onChange={handleMealNumberChange}>
                                <option value={1}>1.Öğün</option>
                                <option value={2}>2.Öğün</option>
                                <option value={3}>3.Öğün</option>
                                <option value={4}>4.Öğün</option>
                                <option value={5}>5.Öğün</option>
                                <option value={6}>6.Öğün</option>
                            </select>  
                    </div>

                    <div className="food-quantity">
                        <span>Miktar:</span>   
                        <input
                            type="number"
                            onChange={calculateMacros}
                            className="inp-quant"
                            placeholder="Giriş yapın"
                        />
                    </div>

                    <div className="save-btn">
                        <button className="btn-add" onClick={trackFoodItem}>Kaydet</button>
                    </div>
                </div> 
                    <p className={message.type}>{message.text}</p>
                </>
            )}
        </div>
    );
}
