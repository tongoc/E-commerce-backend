
<!-- GETTING STARTED -->
## Getting Started

E-commerce Backend Development


### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/tongoc/E-commerce-backend.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

3. Enter your Facebook credential in `config.js`
<img width="1003" alt="Screen Shot 2021-12-13 at 8 37 40 PM" src="https://user-images.githubusercontent.com/8269003/145822440-a852e827-3fe9-49d2-be12-c057705d0b03.png">

4. Start app
     ```sh
   npm run dev
   ```
5. Install ngrok 
    ```sh
   brew install ngrok/ngrok/ngrok
   ```
6. Start a tunnel
    ```sh
    ngrok http 4000
    ```  
7. Fill OAuth configuration in facebook login setting form.
<img width="1066" alt="Screen Shot 2021-12-13 at 8 36 08 PM" src="https://user-images.githubusercontent.com/8269003/145822158-cfbae14d-ff47-4323-8948-85d555446d09.png">

8. Access graphql client & play
`http://localhost:4000/playground`

### Usage

#### Login via facebook
 `GET ngrokUrl/facebook/auth`
  Response authorization token

    {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6Ik5nb2MgVG8iLCJmYWNlYm9va0lkIjoyNzM4MTUwNDgzMTU0NzkxLCJzdWJzY3JpcHRpb24iOjEsImlhdCI6MTYzOTQwMzI2Nn0.ZrYMtay2NiDFqoRd8MhDHN3ho9MntstVWrhdxo9c7gM"
    }

#### Me
1. header
`
    {
        "authorization": "Bearer ${token}"
    }
`
2. body
`
    {
        me {
            facebookId
            name
        }
    }
`
#### Get a list of products
1. body
`{
  products{
    items{
      id
      detail
      fee
    }
    total
  }
}`

#### Purchase an item
1. header
`
    {
        "authorization": "Bearer ${token}"
    }
`
2. body
`mutation {
  purchaseProduct(id: 1)
}`

#### Get purchased items
1. header
`
    {
        "authorization": "Bearer ${token}"
    }
`
`{
  me {
    purchasedProducts{
      items{
        id
        detail
      }
      total
    }
  }
}`
#### Subcribe notifications
1. header
`
    {
        "authorization": "Bearer ${token}"
    }
`
2. body
`
mutation {
	subcrible
}
`
#### Subcribe notifications via socket
1. header
`
    {
        "authorization": "Bearer ${token}"
    }
`
2. body
`
subscription {
  notification{
    content
  }
}`
#### Error code
`
{
  "error": {
    "message": "Unauthorized"
  }
}
`