from endpoint import app, socketio

def main():

    print("Starting the chat API...")
    socketio.run(app, debug=True)

if __name__ == "__main__":
    main()