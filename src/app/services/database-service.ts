export function getParagraph() {
    let response = fetch("http://127.0.0.1:5000/api/v1/get-paragraph", {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }
    
    ).then((response) => response.json());
    return response
}
