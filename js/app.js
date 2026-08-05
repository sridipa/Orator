const app = {

    user: {
        name: "",
        goal: "",
        experience: "",
        challenge: ""
    },

    init(){

        this.loadUser();

    },

    loadUser(){

        const savedUser = localStorage.getItem("orator-user");

        if(savedUser){

            this.user = JSON.parse(savedUser);

            this.showHome();

        }

        else{

            this.showWelcome();

        }

    },

    showWelcome(){

        document.getElementById("app").innerHTML=`

        <div class="welcome">

            <div class="welcome-card">

                <h1>Welcome to Orator</h1>

                <p>Let's personalize your experience.</p>

                <input
                    id="nameInput"
                    placeholder="What should we call you?"
                >

                <button onclick="app.saveName()">

                    Continue

                </button>

            </div>

        </div>

        `;

    },

    saveName(){

        const name=document.getElementById("nameInput").value.trim();

        if(name===""){

            alert("Please enter your name.");

            return;

        }

        this.user.name=name;

        localStorage.setItem(

            "orator-user",

            JSON.stringify(this.user)

        );

        this.showHome();

    },

    greeting(){

        const hour=new Date().getHours();

        if(hour<12) return "Good morning";

        if(hour<17) return "Good afternoon";

        if(hour<22) return "Good evening";

        return "Burning the midnight oil?";

    },

    showHome(){

        document.getElementById("app").innerHTML=`

        <div class="dashboard">

            <h4>${this.greeting()}</h4>

            <h1>${this.user.name}</h1>

            <p>

            I am becoming a better communicator.

            </p>

        </div>

        `;

    }

}

app.init();
