let base_url = "https://datafeed-api-aaron.atelli.ai";

let client_url = `${base_url}/client`;

fetch(client_url, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((result) => {
    const client = document.getElementById("client");
    result["_data"].forEach((clientName) => {
      const option = document.createElement("option");
      option.value = clientName.id;
      option.text = clientName.label;
      client.appendChild(option);
    });
  })
  .catch((error) => console.log("error", error));

let platform_url = `${base_url}/platform`;

fetch(platform_url, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((result) => {
    const platform = document.getElementById("platform");
    result["_data"].forEach((platformName) => {
      const option = document.createElement("option");
      option.value = platformName.id;
      option.text = platformName.label;
      platform.appendChild(option);
    });
  })
  .catch((error) => console.log("error", error));

function requestData() {
  let selectedClient = document.getElementById("client").value;
  let selectedPlatform = document.getElementById("platform").value;
  let utmValue = document.getElementById("utm").value;
  let customFilterParams = document.querySelectorAll(".param");
  const orArray = [];
  const operator = "or";

  let hasValue = false;
  if (customFilterParams.length > 0) {
    customFilterParams.forEach((param) => {
      if (param.children[0].value && param.children[2].value) {
        hasValue = true;
        if (param.children[1].value === "in") {
          const condition = {};
          condition[param.children[0].value] = {
            [param.children[1].value]: [param.children[2].value],
          };
          orArray.push(condition);
        } else {
          const condition = {};
          condition[param.children[0].value] = {
            [param.children[1].value]: param.children[2].value,
          };
          orArray.push(condition);
        }
      }
    });
  }

  let result = {
    filter: {},
  };

  if (hasValue) {
    result = {
      filter: {
        [operator]: orArray,
      },
    };
  }

  resultJson = JSON.stringify(result);

  let $requestUrl = `${base_url}/feed-file`;

  fetch($requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: selectedClient,
      platform_id: selectedPlatform,
      utm: utmValue,
      filter: resultJson,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error();
      }
      alert("Success");
    })
    .then((result) => {
      generateFile(selectedClient, selectedPlatform, JSON.parse(resultJson));
      showAllFeedFile();
    })
    .catch((error) => console.log("error", error));
}

function showAllFeedFile() {
  let feed_url = `${base_url}/feed-file?expand=client,platform`;

  fetch(feed_url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((result) => {
      const tableContent = document.getElementById("table-content");
      tableContent.innerHTML = "";
      result["_data"].forEach((feed) => {
        const tr = document.createElement("tr");
        const tdClient = document.createElement("td");
        const tdPlatform = document.createElement("td");
        const tdFilter = document.createElement("td");
        const tdUtm = document.createElement("td");
        const tdUrl = document.createElement("td");
        const tdDownload = document.createElement("td");
        const tdRefresh = document.createElement("td");
        const tdEdit = document.createElement("td");
        const downloadLink = document.createElement("a");
        const refreshLink = document.createElement("button");
        const edit = document.createElement("button");

        tdClient.innerHTML = feed.client.label;
        tdPlatform.innerHTML = feed.platform.label;
        tdFilter.innerHTML = feed.filter;
        tdUtm.innerHTML = feed.utm;
        tdUrl.innerHTML = feed.file_id
          ? `${base_url}/feed-file/feed/${feed.id}`
          : "File not found";
        downloadLink.href = `${base_url}/feed-file/feed/${feed.id}`;
        downloadLink.innerHTML = "Download";
        refreshLink.innerHTML = "Refresh";
        refreshLink.onclick = () => {
          generateFile(
            feed.client_id,
            feed.platform_id,
            JSON.parse(feed.filter)
          );
          showAllFeedFile();
        };
        edit.innerHTML = "Edit";
        edit.onclick = () => {
          const editPopup = document.querySelector(".edit-popup");
          editPopup.classList.remove("edit-popup-hidden");

          const editClient = document.getElementById("edit-client");
          const editPlatform = document.getElementById("edit-platform");
          const editClientLabel = document.getElementById("edit-client-label");
          const editPlatformLabel = document.getElementById(
            "edit-platform-label"
          );
          const editUtm = document.getElementById("edit-utm");
          const editId = document.getElementById("edit-id");

          editClient.value = feed.client_id;
          editPlatform.value = feed.platform_id;
          editUtm.value = feed.utm;
          editId.value = feed.id;
          editClientLabel.value = feed.client.label;
          editPlatformLabel.value = feed.platform.label;

          let feedFilter = JSON.parse(feed.filter);
          feedFilter = feedFilter.filter;
          if (feedFilter.or) {
            feedFilter.or.forEach((param, index) => {
              addCustomParamEdit();
              const key = Object.keys(param)[0];
              const value = Object.values(param)[0];
              document.getElementById(`edit-param-key-${index + 1}`).value =
                key;
              document.getElementById(`edit-param-control-${index + 1}`).value =
                Object.keys(value)[0];
              document.getElementById(`edit-param-value-${index + 1}`).value =
                Object.values(value)[0];
            });
          }
        };

        tdDownload.appendChild(downloadLink);
        tdRefresh.appendChild(refreshLink);
        tdEdit.appendChild(edit);
        tr.appendChild(tdClient);
        tr.appendChild(tdPlatform);
        tr.appendChild(tdFilter);
        tr.appendChild(tdUtm);
        tr.appendChild(tdUrl);
        tr.appendChild(tdDownload);
        tr.appendChild(tdRefresh);
        tr.appendChild(tdEdit);
        tableContent.appendChild(tr);
      });
    })
    .catch((error) => console.log("error", error));
}

function generateFile(selectedClient, selectedPlatform, customFilter) {
  let requestUrl = `${base_url}/datafeed/export/${selectedClient}/${selectedPlatform}`;

  function jsonToUrl(baseURL, json) {
    const queryString = [];

    function buildQueryString(prefix, obj) {
      if (Array.isArray(obj)) {
        // Handle array values
        obj.forEach((value) => {
          buildQueryString(`${prefix}[]`, value);
        });
      } else if (typeof obj === "object" && obj !== null) {
        // Handle nested objects
        Object.keys(obj).forEach((key) => {
          buildQueryString(`${prefix}[${encodeURIComponent(key)}]`, obj[key]);
        });
      } else {
        queryString.push(`${prefix}=${encodeURIComponent(obj)}`);
      }
    }

    Object.keys(json).forEach((key) => {
      buildQueryString(encodeURIComponent(key), json[key]);
    });

    if (queryString.length === 0) {
      return baseURL;
    }

    return `${baseURL}?${queryString.join("&")}`;
  }

  const url = jsonToUrl(requestUrl, customFilter);

  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error();
      }
      alert("Successfully generated file");
    })
    .catch((error) => console.log("error", error));
}

function addCustomParam() {
  let customParams = document.querySelectorAll(".param").length;
  const customFilterParams = document.querySelector(".custom-filter-params");
  const newParam = document.createElement("div");
  newParam.classList.add("param");
  newParam.innerHTML = `
        <input type="text" name="param-key-${
          customParams + 1
        }" placeholder="Custom Key ${customParams + 1}">
        <select name="filter_control_${customParams + 1}" class="control">
            <option value="in">Equal</option>
            <option value="like">Like</option>
        </select>
        <input type="text" name="param-value-${
          customParams + 1
        }" placeholder="Custom Value ${customParams + 1}">
    `;
  customFilterParams.appendChild(newParam);
}

function updateFeedFile() {
  let editClient = document.getElementById("edit-client").value;
  let editPlatform = document.getElementById("edit-platform").value;
  let editUtm = document.getElementById("edit-utm").value;
  let editId = document.getElementById("edit-id").value;
  let customFilterParams = document.querySelectorAll(".edit-param");
  let requestUrl = `${base_url}/feed-file/${editId}`;
  const orArray = [];
  const operator = "or";

  let hasValue = false;
  if (customFilterParams.length > 0) {
    customFilterParams.forEach((param) => {
      if (param.children[0].value && param.children[2].value) {
        hasValue = true;
        if (param.children[1].value === "in") {
          const condition = {};
          condition[param.children[0].value] = {
            [param.children[1].value]: [param.children[2].value],
          };
          orArray.push(condition);
        } else {
          const condition = {};
          condition[param.children[0].value] = {
            [param.children[1].value]: param.children[2].value,
          };
          orArray.push(condition);
        }
      }
    });
  }

  let result = {
    filter: {},
  };

  if (hasValue) {
    result = {
      filter: {
        [operator]: orArray,
      },
    };
  }

  resultJson = JSON.stringify(result);

  fetch(requestUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: editClient,
      platform_id: editPlatform,
      filter: resultJson,
      utm: editUtm,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error();
      }
      alert("Success");
      closeEditPopup();
    })
    .then((result) => {
      showAllFeedFile();
    })
    .catch((error) => console.log("error", error));
}

function closeEditPopup() {
  const editPopup = document.querySelector(".edit-popup");
  const customParams = document.querySelectorAll(".edit-param");
  editPopup.classList.add("edit-popup-hidden");

  if (customParams.length > 0) {
    customParams.forEach((param) => {
      param.remove();
    });
  }
}

function addCustomParamEdit() {
  let customParams = document.querySelectorAll(".edit-param").length;
  const customFilterParams = document.querySelector(
    ".edit-custom-filter-params"
  );
  const newParam = document.createElement("div");
  newParam.classList.add("edit-param");
  newParam.innerHTML = `
        <input type="text" name="param-key-${
          customParams + 1
        }_edit" placeholder="Custom Key ${
    customParams + 1
  }" id="edit-param-key-${customParams + 1}">
        <select name="filter_control_${
          customParams + 1
        }_edit" class="control" id="edit-param-control-${customParams + 1}">
            <option value="in">Equal</option>
            <option value="like">Like</option>
        </select>
        <input type="text" name="param-value-${
          customParams + 1
        }_edit" placeholder="Custom Value ${
    customParams + 1
  }" id="edit-param-value-${customParams + 1}">
    `;
  customFilterParams.appendChild(newParam);
}

showAllFeedFile();
const editPopup = document.querySelector(".edit-popup");
const closeButton = document.querySelector(".close");
closeButton.addEventListener("click", function () {
  closeEditPopup();
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeEditPopup();
  }
});
