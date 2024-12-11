import React, { useEffect, useState } from "react";
import CustomMap from "./components/CustomeMap";

const App = () => {
  const [markers, setMarkers] = useState([]);

  return (
    <>
      <CustomMap markers={markers} />
    </>
  )
}

export default App
