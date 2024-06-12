import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './component/Register'
import Login from './component/Login'
import NotFound from './component/NotFound'
import Diet from './component/Diet'
import Private from './component/Private'
import SearchFood from './component/SearchFood'
import Demo from './component/Demo'
import CreateFood from './component/CreateFood'
import TrackWeight from './component/TrackWeight'
import MealFunctions from './component/MealFunctions/MealFunctions'

import { UserContext } from './context/UserContext'
import { useEffect, useState } from 'react'


function App() {

    // ------------------Variables------------------

    const [loggedUser, setLoggedUser] = useState(JSON.parse(localStorage.getItem("app-user")));
    const [currentDateView, setCurrentDateView] = useState(new Date());

    useEffect(() => {
        console.log("Context Object", loggedUser)
    }, [loggedUser]);

    return (
        <UserContext.Provider value={{ loggedUser, setLoggedUser, currentDateView, setCurrentDateView }}>

            <BrowserRouter>

                <Routes>

                    <Route path='/' element={<Login />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/diet' element={<Private Component={Diet} />} />
                    <Route path='/search' element={<Private Component={SearchFood} />} />
                    <Route path='/createfood' element={<Private Component={CreateFood} />} />
                    <Route path='/weight' element={<Private Component={TrackWeight} />} />
                    <Route path='/demo' element={<Private Component={Demo} />} />
                    <Route path='/mealfunctions' element={<Private Component={MealFunctions} />} />
                    <Route path='/*' element={<NotFound />} />

                </Routes>

            </BrowserRouter>

        </UserContext.Provider>
    )
}

export default App
