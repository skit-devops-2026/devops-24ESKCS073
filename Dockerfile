FROM nginx:alpine

COPY index.html add-expense.html budget.html ledger.html insights.html shared.html /usr/share/nginx/html/

COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

EXPOSE 80
