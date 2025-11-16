'use strict';

document.addEventListener("DOMContentLoaded", function () {
  const classificationList = document.querySelector("#classificationList");

  if (classificationList) {
    classificationList.addEventListener("change", function () {
      const classification_id = classificationList.value;
      console.log(`Selected classification_id: ${classification_id}`);

      if (!classification_id) {
        document.getElementById("inventoryDisplay").innerHTML = "";
        return;
      }

      const url = "/inv/getInventory/" + classification_id;

      fetch(url)
        .then(response => {
          if (response.ok) return response.json();
          throw new Error("Network response was not OK");
        })
        .then(data => {
          console.log(data);
          buildInventoryList(data);
        })
        .catch(error => console.error("Fetch error: ", error));
    });
  }
});

// Build inventory table HTML and inject into DOM
function buildInventoryList(data) {
  const inventoryDisplay = document.getElementById("inventoryDisplay");
  if (!data || data.length === 0) {
    inventoryDisplay.innerHTML = "<p class='notice'>No vehicles found.</p>";
    return;
  }

  let html = `
    <thead>
      <tr>
        <th>Vehicle Name</th>
        <th>&nbsp;</th>
        <th>&nbsp;</th>
      </tr>
    </thead>
    <tbody>
  `;

  data.forEach(vehicle => {
    html += `
      <tr>
        <td>${vehicle.inv_make} ${vehicle.inv_model}</td>
        <td><a href='/inv/edit/${vehicle.inv_id}' title='Click to update'>Modify</a></td>
        <td><a href='/inv/delete/${vehicle.inv_id}' title='Click to delete'>Delete</a></td>
      </tr>
    `;
  });

  html += "</tbody>";
  inventoryDisplay.innerHTML = html;
}
