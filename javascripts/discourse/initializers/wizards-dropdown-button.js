import { withPluginApi } from "discourse/lib/plugin-api";
import { h } from "virtual-dom";
import { iconNode } from "discourse-common/lib/icon-library";
import { default as composerModal } from "discourse/models/composer";

export default {
  name: "wizards-dropdown-button",
  initialize() {
    withPluginApi("0.8.41", (api) => {
      api.decorateWidget("header-buttons:after", (helper) => {
        if (settings.show_button_to_visitors == false) {
          if (api.getCurrentUser() == null) return;
        }

        let menu_links_buffer = [],
          menu_links = settings.dropdown_items.split("|");

        if (menu_links !== null) {
          if (menu_links.length > 0) {
            menu_links.forEach((link) => {
              const attributes = link.split(",");

              // add an additional class if it is given in settings
              let targetClass;
              if (typeof attributes[3] === "undefined") {
                targetClass = "";
              } else {
                targetClass = `${attributes[3]}`.trim();
              }

              menu_links_buffer.push(
                h(
                  `a.btn.btn-default.btn-icon-text.${targetClass}`,
                  {
                    href: attributes[2],
                    title: attributes[1],
                  },
                  [
                    iconNode(attributes[0]),
                    [h("span.d-button-label", `${attributes[1]}`)],
                  ]
                )
              );
            });
          }
        }

        if (settings.new_topic_as_dropdown == true) {
          let container = api.container,
            composerController = container.lookup("controller:composer");

          const createTopic = function () {
            const controller = container.lookup(
                "controller:navigation/category"
              ),
              category = controller.get("category.id"),
              topicCategory = container
                .lookup("route:topic")
                .get("context.category.id"),
              categoryd = topicCategory ? topicCategory : category;

            let $createTopicDisabled = $("#create-topic.disabled");
            if ($createTopicDisabled.length) {
              composerController.open({
                action: composerModal.CREATE_TOPIC,
                draftKey: composerModal.DRAFT,
              });
            } else {
              composerController.open({
                action: composerModal.CREATE_TOPIC,
                categoryId: categoryd,
                draftKey: composerModal.DRAFT,
              });
            }
          };

          menu_links_buffer.push(
            h("a.btn.btn-default.btn-icon-text", { onclick: createTopic }, [
              iconNode(settings.new_topic_icon),
              [h("span.d-button-label", `${settings.new_topic_title}`)],
            ])
          );
        }
        //Add class toggle used in mobile.scss; desktop uses hover
        const toggleDropdown = function () {
          const dropdownContent = document.getElementById(
            "dropdown-button-content"
          );
          dropdownContent.classList.toggle("show-dropdown");
        };

        let menu_buffer = [
          h(
            "button.btn.btn-primary.btn-small.btn-icon-text",
            { onclick: toggleDropdown },
            [
              iconNode(settings.button_icon),
              [h("span.d-button-label", `${settings.button_title}`)],
            ]
          ),
        ];

        menu_buffer.push(h("div#dropdown-button-content", menu_links_buffer));

        return h("div#dropdown-button", menu_buffer);
      });
    });
  },
};
