from web.web_view import WebView


class ToolsView(WebView):
    def __init__(
        self,
        main_ui,
        port=4990,
    ):
        super().__init__(main_ui)
        self.main_ui = main_ui
        self.start(port)

    def process_client_message(self, data):
        # Got some input from the frontend
        print(data)

        if data["event"] == "select_cp":
            self.main_ui.update_active_gcp(data["point_id"])
        elif data["event"] == "delCP":
            self.main_ui.remove_gcp()
        elif data["event"] == "addCP":
            self.main_ui.add_gcp()

        self.sync_to_client()

    def sync_to_client(self):
        # Sync state to frontend
        """
        Sends all the data required to initialize or sync the tools view
        """
        data = {
            "points": self.main_ui.gcp_manager.points,
            "selected_point": self.main_ui.curr_point,
        }
        self.send_sse_message(data)
