

---------------------------------------------------------------
-- Datamoa
---------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SET TIME ZONE 'Asia/Seoul';

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
INSERT INTO tb_page (category_id, page_name, page_url, page_description)
VALUES (1, '복권방 찾기', '/toto', '복권방 위치 찾기 페이지입니다.');

---------------------------------------------------------------
-- Toilet
---------------------------------------------------------------

CREATE DATABASE toilet;
\connect toilet;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SET TIME ZONE 'Asia/Seoul';

CREATE TABLE tb_toilet_category (
    toilet_category_id INT GENERATED ALWAYS AS IDENTITY,
    toilet_category_name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_toilet_category_id PRIMARY KEY (toilet_category_id)
);

CREATE TABLE tb_toilet (
    toilet_id UUID DEFAULT uuid_generate_v4(),
    toilet_category_id INT NOT NULL,
    toilet_name VARCHAR(60)[] NOT NULL,
    toilet_region VARCHAR(20) NOT NULL,
    toilet_address VARCHAR(100),
    toilet_road_address VARCHAR(100),
    management_agency VARCHAR(40),
    phone_number VARCHAR(20),
    open_hour VARCHAR(60),
    wsg84_x DOUBLE PRECISION NOT NULL,
    wsg84_y DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP,
    CONSTRAINT pk_toilet_id PRIMARY KEY (toilet_id),
    CONSTRAINT fk_toilet_category_id FOREIGN KEY (toilet_category_id)
        REFERENCES "tb_toilet_category"(toilet_category_id)
        ON UPDATE CASCADE
);

CREATE TABLE tb_toilet_manual (
    toilet_id UUID DEFAULT uuid_generate_v4(),
    toilet_category_id INT NOT NULL,
    operation VARCHAR(10)  NOT NULL,
    toilet_name VARCHAR(60)[] NOT NULL,
    toilet_region VARCHAR(20) NOT NULL,
    toilet_address VARCHAR(100),
    toilet_road_address VARCHAR(100),
    management_agency VARCHAR(40),
    phone_number VARCHAR(20),
    open_hour VARCHAR(60),
    wsg84_x DOUBLE PRECISION NOT NULL,
    wsg84_y DOUBLE PRECISION NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT pk_toilet_updated_id PRIMARY KEY (toilet_id),
    CONSTRAINT fk_toilet_category_updated_id FOREIGN KEY (toilet_category_id)
        REFERENCES "tb_toilet_category"(toilet_category_id)
        ON UPDATE CASCADE
);

---------------------------------------------------------------

CREATE OR REPLACE FUNCTION func_update_time()
    RETURNS TRIGGER AS
        $$ BEGIN
            IF TG_OP = 'INSERT' THEN
                INSERT
                    INTO tb_toilet_manual (toilet_id, toilet_category_id, toilet_name, operation, toilet_region, toilet_address, toilet_road_address, management_agency, phone_number, open_hour, wsg84_x, wsg84_y)
                    VALUES (NEW.toilet_id, NEW.toilet_category_id, NEW.toilet_name, 'insert', NEW.toilet_region, new.toilet_address, NEW.toilet_road_address, NEW.management_agency, NEW.phone_number, NEW.open_hour, NEW.wsg84_x, NEW.wsg84_y)
                    ON CONFLICT (toilet_id) DO UPDATE
                    SET toilet_category_id = NEW.toilet_category_id, toilet_name = NEW.toilet_name, operation = 'insert', toilet_region = NEW.toilet_region, toilet_address = NEW.toilet_address, toilet_road_address = NEW.toilet_road_address, management_agency = NEW.management_agency, phone_number = NEW.phone_number, open_hour = NEW.open_hour, wsg84_x = NEW.wsg84_x, wsg84_y = NEW.wsg84_y, updated_at = now();
                RETURN NEW;
            ELSIF TG_OP = 'UPDATE' THEN
                NEW.updated_at = now();
                INSERT
                    INTO tb_toilet_manual (toilet_id, toilet_category_id, toilet_name, operation, toilet_region, toilet_address, toilet_road_address, management_agency, phone_number, open_hour, wsg84_x, wsg84_y)
                    VALUES (NEW.toilet_id, NEW.toilet_category_id, NEW.toilet_name, 'update', NEW.toilet_region, new.toilet_address, NEW.toilet_road_address, NEW.management_agency, NEW.phone_number, NEW.open_hour, NEW.wsg84_x, NEW.wsg84_y)
                    ON CONFLICT (toilet_id) DO UPDATE
                    SET toilet_category_id = NEW.toilet_category_id, toilet_name = NEW.toilet_name, operation = 'update', toilet_region = NEW.toilet_region, toilet_address = NEW.toilet_address, toilet_road_address = NEW.toilet_road_address, management_agency = NEW.management_agency, phone_number = NEW.phone_number, open_hour = NEW.open_hour, wsg84_x = NEW.wsg84_x, wsg84_y = NEW.wsg84_y, updated_at = now();
                RETURN NEW;
            ELSIF TG_OP = 'DELETE' THEN
                INSERT
                    INTO tb_toilet_manual (toilet_id, toilet_category_id, toilet_name, operation, toilet_region, toilet_address, toilet_road_address, management_agency, phone_number, open_hour, wsg84_x, wsg84_y)
                    VALUES (OLD.toilet_id, OLD.toilet_category_id, OLD.toilet_name, 'delete', OLD.toilet_region, OLD.toilet_address, OLD.toilet_road_address, OLD.management_agency, OLD.phone_number, OLD.open_hour, OLD.wsg84_x, OLD.wsg84_y)
                    ON CONFLICT (toilet_id) DO UPDATE
                    SET toilet_category_id = OLD.toilet_category_id, toilet_name = OLD.toilet_name, operation = 'delete', toilet_region = OLD.toilet_region, toilet_address = OLD.toilet_address, toilet_road_address = OLD.toilet_road_address, management_agency = OLD.management_agency, phone_number = OLD.phone_number, open_hour = OLD.open_hour, wsg84_x = OLD.wsg84_x, wsg84_y = OLD.wsg84_y, updated_at = now();
                RETURN OLD;
            END IF;
        END; $$
    LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trig_update_time
    BEFORE INSERT OR UPDATE OR DELETE ON tb_toilet
    FOR EACH ROW
    EXECUTE PROCEDURE func_update_time();

---------------------------------------------------------------

INSERT INTO tb_toilet_category (toilet_category_name)
    VALUES ('공중 화장실'), ('개방 화장실'), ('간이 화장실'), ('기타');

---------------------------------------------------------------
-- Toto
---------------------------------------------------------------

CREATE DATABASE toto;
\connect toto;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SET TIME ZONE 'Asia/Seoul';

CREATE TABLE tb_toto (
    toto_id UUID DEFAULT uuid_generate_v4(),
    toto_category VARCHAR(10)[] NOT NULL,
    toto_name VARCHAR(60) NOT NULL,
    toto_region VARCHAR(20) NOT NULL,
    toto_address VARCHAR(100),
    toto_road_address VARCHAR(100),
    address_detail VARCHAR(30),
    phone_number VARCHAR(20),
    wsg84_x DOUBLE PRECISION NOT NULL,
    wsg84_y DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP,
    CONSTRAINT pk_toto_id PRIMARY KEY (toto_id)
);

---------------------------------------------------------------

