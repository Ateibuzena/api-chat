from endpoint import app

def main():
    print("Starting the chat API...")
    app.run(debug=True)

if __name__ == "__main__":
    main()