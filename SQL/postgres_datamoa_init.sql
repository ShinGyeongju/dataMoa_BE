
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

---------------------------------------------------------------

CREATE TABLE tb_page_category (
    category_id INT GENERATED ALWAYS AS IDENTITY,
    category_name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_category_id PRIMARY KEY (category_id)
);

CREATE TABLE tb_page (
    page_id INT GENERATED ALWAYS AS IDENTITY,
    category_id INT NOT NULL,
    page_name VARCHAR(30) NOT NULL,
    page_url VARCHAR(100) NOT NULL,
    page_description VARCHAR(300),
    CONSTRAINT pk_page_id PRIMARY KEY (page_id),
    CONSTRAINT fk_category_id FOREIGN KEY (category_id)
        REFERENCES "tb_page_category"(category_id)
        ON UPDATE CASCADE
);

CREATE TABLE tb_voc_category (
    voc_category_id INT GENERATED ALWAYS AS IDENTITY,
    voc_category_name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_voc_category_id PRIMARY KEY (voc_category_id)
);

CREATE TABLE tb_voc (
    voc_id UUID DEFAULT uuid_generate_v4(),
    page_id INT,
    voc_category_id INT NOT NULL,
    voc_content VARCHAR(500) NOT NULL,
    CONSTRAINT pk_voc_id PRIMARY KEY (voc_id),
    CONSTRAINT fk_page_id FOREIGN KEY (page_id)
        REFERENCES "tb_page"(page_id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_voc_category_id FOREIGN KEY (voc_category_id)
        REFERENCES "tb_voc_category"(voc_category_id)
        ON UPDATE CASCADE
);

---------------------------------------------------------------

INSERT INTO tb_voc_category (voc_category_name) VALUES ('오류 제보');
INSERT INTO tb_voc_category (voc_category_name) VALUES ('개선 및 제안');
INSERT INTO tb_voc_category (voc_category_name) VALUES ('기타 문의');

INSERT INTO tb_page_category (category_name) VALUES ('위치 찾기');

INSERT INTO tb_page (category_id, page_name, page_url, page_description)
VALUES (1, '화장실 찾기', '/toilet', '화장실 위치 찾기 페이지입니다.');
